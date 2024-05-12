document.addEventListener("DOMContentLoaded", function() {

    fetch('data.json')
        .then((response) => response.json())
        .then((json) => {
            const multiStepForm = new MultiStepForm(json);

            multiStepForm.init();
        });

});

class MultiStepForm{
    constructor(data) {
        this.data = data;
        this.app = document.querySelector('#app');
        this.appClass = 'ms-form';
    }
    init(){
        this.addFormAttributes();
        this.addContent();
        this.addButtons();
        this.addHidden();

        this.initActions();
    }
    addFormAttributes(){
        let app = this.app,
            appClass = this.appClass;

        app.classList.add(appClass);
        app.setAttribute('data-step', '1');
    }
    addContent(){
        const thisClass = this,
            app = this.app,
            data = this.data,
            contentContainer = document.createElement('div'),
            containerClass = this.appClass + '-content';

        contentContainer.classList.add(containerClass);

        contentContainer.innerHTML = thisClass.getContent(0, true);

        app.append(contentContainer);
    }
    getContent(i, returnContent = false){
        const thisClass = this,
            app = this.app,
            data = this.data,
            appClass = this.appClass;

        let content = `<h2>${data[i].question}</h2>`;

        content += thisClass.addAnswers(data[i].answers);

        if(returnContent) return content;

        document.querySelector('.' + appClass + ' .' + appClass + '-content').innerHTML = content;
    }
    addAnswers(answers){
        let output = '',
            appClass = this.appClass;

        for (const name in answers) {
            console.log(typeof answers[name]);
            output += '<label>';
            output += `<input class="${appClass}-option" type="radio" name="answer" value="${name}">`;
            output += answers[name]['image'] ? `<img src="${answers[name]['image']}">` : '';
            output += typeof answers[name] == 'string' ? answers[name] : answers[name]['text'];
            output += '</label>';
        }

        return output;
    }
    addButtons(){
        let thisClass = this,
            app = this.app,
            buttonsArea = document.createElement('div'),
            beforeBtn = '<button class="prev">Назад</button>',
            nextBtn = '<button class="next">Вперед</button>',
            buttonsAreaClass = this.appClass + '-buttons';

        buttonsArea.classList.add(buttonsAreaClass);

        buttonsArea.innerHTML = beforeBtn + nextBtn;

        app.append(buttonsArea);

        thisClass.checkButtonsState();
    }
    addHidden(){
        const thisClass = this,
            app = this.app,
            appClass = this.appClass,
            div = document.createElement('div'),
            input = document.createElement('input');

        div.classList.add(`${appClass}-hidden`);

        div.innerHTML = '<input type="hidden" name="result">';

        app.append(div);

        thisClass.setResult();
    }
    setResult(key = false, value = false){
        const thisClass = this,
            data = this.data,
            app = this.app,
            resultInput = app.querySelector('[name="result"]');

        let result = [];

        if(key !== false){
            let inputValue = resultInput.value;

            inputValue = JSON.parse(inputValue);

            inputValue[key] = value;

            result = JSON.stringify(inputValue);
        }else{
            for (let i = 0; i < data.length; i++){
                result[i] = false;
            }

            result = JSON.stringify(result);
        }

        resultInput.value = result;
    }
    initActions(){
        const app = this.app,
            thisClass = this,
            appClass = this.appClass;

        app.addEventListener('click', function(e){
            if(e.target.classList.contains('next')) thisClass.step('next');
            if(e.target.classList.contains('prev')) thisClass.step('prev');
            if(e.target.classList.contains(appClass + '-option')) thisClass.checkButtonsState();
        });
    }
    step(direction){
        const thisClass = this,
            app = this.app,
            data = this.data,
            result = app.querySelector('[name="answer"]:checked').value;

        thisClass.setResult(app.dataset.step - 1, result);

        let step = '';

        if(direction == 'prev') step = app.dataset.step !== '1' ? --app.dataset.step : 1;
        if(direction == 'next') step = data.length <= app.dataset.step ? app.dataset.step : ++app.dataset.step;

        app.dataset.step = step;

        thisClass.getContent(step - 1);
        thisClass.setAnswerValue();
        thisClass.checkButtonsState();
    }

    setAnswerValue(){
        const app = this.app,
            resultInput = app.querySelector('[name="result"]'),
            step = app.dataset.step - 1,
            appClass = this.appClass;

        let result = JSON.parse(resultInput.value),
            inputName = result[step];

        if(inputName !== false){
            app.querySelector(`.${appClass}-content [value="${inputName}"]`).checked = true;
        }
    }
    checkButtonsState(){
        const app = this.app,
            data = this.data,
            inputs = app.querySelectorAll('.' + this.appClass + '-content input'),
            prevButton = app.querySelector('.prev'),
            nextButton = app.querySelector('.next');

        prevButton.disabled = false;
        nextButton.disabled = false;

        if(app.dataset.step === '1') prevButton.disabled = true;
        if(app.dataset.step == data.length) nextButton.disabled = true;

        let optionsSelected = false;

        inputs.forEach(function (element){
            if(element.checked) optionsSelected = true;
        });

        if(!optionsSelected) nextButton.disabled = true;
    }
}