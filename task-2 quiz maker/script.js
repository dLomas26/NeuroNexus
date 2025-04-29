document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const creatorModeBtn = document.getElementById('creator-mode-btn');
    const takerModeBtn = document.getElementById('taker-mode-btn');
    const quizCreatorSection = document.getElementById('quiz-creator');
    const quizTakerSection = document.getElementById('quiz-taker');
    
    // Quiz Creator Elements
    const addQuestionBtn = document.getElementById('add-question-btn');
    const saveQuizBtn = document.getElementById('save-quiz-btn');
    const questionsContainer = document.getElementById('questions-container');
    const quizzesList = document.getElementById('quizzes-list');
    const quizTitleInput = document.getElementById('quiz-title');
    const quizDescriptionInput = document.getElementById('quiz-description');
    
    // Quiz Taker Elements
    const quizzesToTake = document.getElementById('quizzes-to-take');
    const quizTakingArea = document.getElementById('quiz-taking-area');
    const quizQuestionsContainer = document.getElementById('quiz-questions-container');
    const currentQuizTitle = document.getElementById('current-quiz-title');
    const currentQuizDescription = document.getElementById('current-quiz-description');
    const submitQuizBtn = document.getElementById('submit-quiz-btn');
    const backToQuizzesBtn = document.getElementById('back-to-quizzes-btn');
    const quizResults = document.getElementById('quiz-results');
    const scoreDisplay = document.getElementById('score-display');
    const answersReview = document.getElementById('answers-review');
    const takeAnotherBtn = document.getElementById('take-another-btn');
    
    // State
    let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    let currentQuiz = null;
    let userAnswers = [];
    
    // Initialize the app
    init();
    
    function init() {
        // Set up event listeners
        creatorModeBtn.addEventListener('click', () => switchMode('creator'));
        takerModeBtn.addEventListener('click', () => switchMode('taker'));
        
        addQuestionBtn.addEventListener('click', addQuestion);
        saveQuizBtn.addEventListener('click', saveQuiz);
        
        submitQuizBtn.addEventListener('click', submitQuiz);
        backToQuizzesBtn.addEventListener('click', () => {
            quizTakingArea.classList.add('hidden');
            document.getElementById('available-quizzes').classList.remove('hidden');
        });
        
        takeAnotherBtn.addEventListener('click', () => {
            quizResults.classList.add('hidden');
            document.getElementById('available-quizzes').classList.remove('hidden');
        });
        
        // Load saved quizzes
        renderSavedQuizzes();
        renderAvailableQuizzes();
    }
    
    function switchMode(mode) {
        if (mode === 'creator') {
            quizCreatorSection.classList.add('active');
            quizTakerSection.classList.remove('active');
            creatorModeBtn.classList.add('primary');
            takerModeBtn.classList.remove('primary');
        } else {
            quizCreatorSection.classList.remove('active');
            quizTakerSection.classList.add('active');
            creatorModeBtn.classList.remove('primary');
            takerModeBtn.classList.add('primary');
        }
    }
    
    // Quiz Creator Functions
    function addQuestion() {
        const questionId = Date.now();
        
        const questionHTML = `
            <div class="question-card" id="question-${questionId}">
                <div class="form-group">
                    <label for="question-text-${questionId}">Question:</label>
                    <input type="text" id="question-text-${questionId}" required>
                </div>
                
                <div class="form-group">
                    <label>Options:</label>
                    <div id="options-container-${questionId}">
                        <div class="option-item">
                            <input type="text" id="option-1-${questionId}" placeholder="Option 1" required>
                            <input type="radio" name="correct-answer-${questionId}" value="1" required>
                            <label>Correct</label>
                        </div>
                        <div class="option-item">
                            <input type="text" id="option-2-${questionId}" placeholder="Option 2" required>
                            <input type="radio" name="correct-answer-${questionId}" value="2">
                            <label>Correct</label>
                        </div>
                    </div>
                    <button type="button" class="btn" onclick="addOption(${questionId})">Add Option</button>
                </div>
                
                <div class="question-actions">
                    <button type="button" class="btn danger" onclick="removeQuestion(${questionId})">Remove Question</button>
                </div>
            </div>
        `;
        
        questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
    }
    
    function addOption(questionId) {
        const optionsContainer = document.getElementById(`options-container-${questionId}`);
        const optionCount = optionsContainer.children.length + 1;
        
        const optionHTML = `
            <div class="option-item">
                <input type="text" id="option-${optionCount}-${questionId}" placeholder="Option ${optionCount}" required>
                <input type="radio" name="correct-answer-${questionId}" value="${optionCount}">
                <label>Correct</label>
            </div>
        `;
        
        optionsContainer.insertAdjacentHTML('beforeend', optionHTML);
    }
    
    function removeQuestion(questionId) {
        const questionElement = document.getElementById(`question-${questionId}`);
        if (questionElement) {
            questionElement.remove();
        }
    }
    
    function saveQuiz() {
        const title = quizTitleInput.value.trim();
        const description = quizDescriptionInput.value.trim();
        
        if (!title) {
            alert('Please enter a quiz title');
            return;
        }
        
        const questionElements = questionsContainer.querySelectorAll('.question-card');
        if (questionElements.length === 0) {
            alert('Please add at least one question');
            return;
        }
        
        const questions = [];
        
        questionElements.forEach(questionElement => {
            const questionId = questionElement.id.split('-')[1];
            const questionText = document.getElementById(`question-text-${questionId}`).value.trim();
            
            if (!questionText) {
                return;
            }
            
            const options = [];
            let correctAnswer = null;
            
            const optionInputs = questionElement.querySelectorAll('.option-item input[type="text"]');
            const correctAnswerRadios = questionElement.querySelectorAll(`input[name="correct-answer-${questionId}"]`);
            
            correctAnswerRadios.forEach(radio => {
                if (radio.checked) {
                    correctAnswer = parseInt(radio.value);
                }
            });
            
            if (correctAnswer === null) {
                alert(`Please select a correct answer for question: ${questionText}`);
                return;
            }
            
            optionInputs.forEach((input, index) => {
                const optionText = input.value.trim();
                if (optionText) {
                    options.push({
                        id: index + 1,
                        text: optionText
                    });
                }
            });
            
            if (options.length < 2) {
                alert(`Question "${questionText}" must have at least 2 options`);
                return;
            }
            
            questions.push({
                id: questionId,
                text: questionText,
                options: options,
                correctAnswer: correctAnswer
            });
        });
        
        if (questions.length === 0) {
            alert('Please add valid questions with options');
            return;
        }
        
        const quiz = {
            id: Date.now(),
            title: title,
            description: description,
            questions: questions,
            createdAt: new Date().toISOString()
        };
        
        quizzes.push(quiz);
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        
        // Reset form
        quizTitleInput.value = '';
        quizDescriptionInput.value = '';
        questionsContainer.innerHTML = '';
        
        // Update UI
        renderSavedQuizzes();
        renderAvailableQuizzes();
        
        alert('Quiz saved successfully!');
    }
    
    function renderSavedQuizzes() {
        quizzesList.innerHTML = '';
        
        if (quizzes.length === 0) {
            quizzesList.innerHTML = '<p>No quizzes saved yet.</p>';
            return;
        }
        
        quizzes.forEach(quiz => {
            const quizElement = document.createElement('div');
            quizElement.className = 'quiz-card';
            quizElement.innerHTML = `
                <h4>${quiz.title}</h4>
                <p>${quiz.description || 'No description'}</p>
                <p><small>${quiz.questions.length} questions</small></p>
                <div class="actions">
                    <button class="btn danger" onclick="deleteQuiz(${quiz.id})">Delete</button>
                </div>
            `;
            quizzesList.appendChild(quizElement);
        });
    }
    
    function deleteQuiz(quizId) {
        if (confirm('Are you sure you want to delete this quiz?')) {
            quizzes = quizzes.filter(quiz => quiz.id !== quizId);
            localStorage.setItem('quizzes', JSON.stringify(quizzes));
            renderSavedQuizzes();
            renderAvailableQuizzes();
        }
    }
    
    // Quiz Taker Functions
    function renderAvailableQuizzes() {
        quizzesToTake.innerHTML = '';
        
        if (quizzes.length === 0) {
            quizzesToTake.innerHTML = '<p>No quizzes available yet.</p>';
            return;
        }
        
        quizzes.forEach(quiz => {
            const quizElement = document.createElement('div');
            quizElement.className = 'quiz-card';
            quizElement.innerHTML = `
                <h4>${quiz.title}</h4>
                <p>${quiz.description || 'No description'}</p>
                <p><small>${quiz.questions.length} questions</small></p>
                <div class="actions">
                    <button class="btn primary" onclick="startQuiz(${quiz.id})">Take Quiz</button>
                </div>
            `;
            quizzesToTake.appendChild(quizElement);
        });
    }
    
    function startQuiz(quizId) {
        currentQuiz = quizzes.find(quiz => quiz.id === quizId);
        if (!currentQuiz) return;
        
        document.getElementById('available-quizzes').classList.add('hidden');
        quizTakingArea.classList.remove('hidden');
        
        currentQuizTitle.textContent = currentQuiz.title;
        currentQuizDescription.textContent = currentQuiz.description || '';
        
        renderQuizQuestions();
    }
    
    function renderQuizQuestions() {
        quizQuestionsContainer.innerHTML = '';
        userAnswers = [];
        
        currentQuiz.questions.forEach((question, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'quiz-question';
            questionElement.innerHTML = `
                <h4>Question ${index + 1}: ${question.text}</h4>
            `;
            
            question.options.forEach(option => {
                const optionElement = document.createElement('div');
                optionElement.className = 'quiz-option';
                optionElement.innerHTML = `
                    <input type="radio" name="question-${question.id}" id="option-${question.id}-${option.id}" value="${option.id}">
                    <label for="option-${question.id}-${option.id}">${option.text}</label>
                `;
                
                optionElement.addEventListener('click', () => {
                    // Remove selected class from all options in this question
                    questionElement.querySelectorAll('.quiz-option').forEach(opt => {
                        opt.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked option
                    optionElement.classList.add('selected');
                    
                    // Update user answers
                    const existingAnswerIndex = userAnswers.findIndex(a => a.questionId === question.id);
                    if (existingAnswerIndex !== -1) {
                        userAnswers[existingAnswerIndex].answerId = option.id;
                    } else {
                        userAnswers.push({
                            questionId: question.id,
                            answerId: option.id
                        });
                    }
                });
                
                questionElement.appendChild(optionElement);
            });
            
            quizQuestionsContainer.appendChild(questionElement);
        });
    }
    
    function submitQuiz() {
        if (userAnswers.length < currentQuiz.questions.length) {
            alert('Please answer all questions before submitting.');
            return;
        }
        
        let score = 0;
        const results = [];
        
        currentQuiz.questions.forEach(question => {
            const userAnswer = userAnswers.find(a => a.questionId === question.id);
            const isCorrect = userAnswer && userAnswer.answerId === question.correctAnswer;
            
            if (isCorrect) {
                score++;
            }
            
            results.push({
                question: question.text,
                userAnswer: userAnswer ? question.options.find(o => o.id === userAnswer.answerId).text : 'Not answered',
                correctAnswer: question.options.find(o => o.id === question.correctAnswer).text,
                isCorrect: isCorrect
            });
        });
        
        // Display results
        quizTakingArea.classList.add('hidden');
        quizResults.classList.remove('hidden');
        
        const percentage = Math.round((score / currentQuiz.questions.length) * 100);
        scoreDisplay.innerHTML = `You scored ${score} out of ${currentQuiz.questions.length} (${percentage}%)`;
        
        // Display answer review
        answersReview.innerHTML = '';
        results.forEach(result => {
            const answerItem = document.createElement('div');
            answerItem.className = `answer-item ${result.isCorrect ? 'correct' : 'incorrect'}`;
            answerItem.innerHTML = `
                <p><strong>Question:</strong> ${result.question}</p>
                <p><strong>Your answer:</strong> ${result.userAnswer}</p>
                <p><strong>Correct answer:</strong> ${result.correctAnswer}</p>
            `;
            answersReview.appendChild(answerItem);
        });
    }
    
    // Make functions available globally for HTML onclick attributes
    window.addOption = addOption;
    window.removeQuestion = removeQuestion;
    window.deleteQuiz = deleteQuiz;
    window.startQuiz = startQuiz;
});