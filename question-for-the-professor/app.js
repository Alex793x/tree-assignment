import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let animalQuestions = [];
let currentQuestion;
let currentNode;

function loadQuestions() {
    try {
        const data = fs.readFileSync('animalsQuestionTree.json');
        animalQuestions = JSON.parse(data);
        [currentQuestion] = animalQuestions;
        currentNode = animalQuestions[0];
    } catch (err) {
        console.error('Error reading animals.json:', err);
        process.exit(1);
    }
}

function saveQuestions() {
    try {
        fs.writeFileSync('animalsQuestionTree.json', JSON.stringify(animalQuestions, null, 2));
    } catch (err) {
        console.error('Error writing to animals.json:', err);
        process.exit(1);
    }
}

function askQuestion() {
    rl.question(`${currentQuestion.question} (yes/no): `, (answer) => {
        answer = answer.toLowerCase();
        if (answer === 'yes' && currentQuestion.yes !== undefined) {
            currentQuestion = currentQuestion.yes;
            askQuestion();
        } else if (answer === 'no' && currentQuestion.no !== undefined) {
            currentQuestion = currentQuestion.no;
            askQuestion(currentQuestion.no);
        } else if (answer !== 'yes' && answer !== 'no') {
            console.log('Invalid input. Please enter "yes" or "no".');
            askQuestion();
        } else {
            console.log(answer === 'yes' ? `I don't have more to ask.` : `I give up! I couldn't guess your animal.`);
            provideNewQuestion(currentQuestion.question, answer === 'yes');
        }
    });
}

function provideNewQuestion(lastQuestion, isYesAnswer) {
    rl.question("Could you please provide me with one more question I could ask next time - must be yes or no answerable? ", (answer) => {
        if (answer.length > 5) {
            appendNewNode(currentNode, lastQuestion, answer, isYesAnswer);
            rl.close();
        } else {
            console.log('Invalid input. Please enter a question with at least 5 characters.');
            provideNewQuestion();
        }
    });
}

function appendNewNode(node, searchQuestion, newQuestion, isYesAnswer) {
    if (node.question === searchQuestion) {
        node[isYesAnswer ? 'yes' : 'no'] = { question: newQuestion };
        return node;
    }

    if (node.yes || node.no) {
        const resultFromBranch = appendNewNode(node[isYesAnswer ? 'yes' : 'no'], searchQuestion, newQuestion, isYesAnswer);
        if (resultFromBranch) {
            return resultFromBranch;
        }
    }

    return null;
}

console.log('Think of an animal, and I will try to guess it!');

loadQuestions();
askQuestion(0);

rl.on('close', () => {
    saveQuestions();
    process.exit(0);
});