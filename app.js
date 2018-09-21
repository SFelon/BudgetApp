//Budget Controller
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if(totalIncome > 0 ){  
            this.percentage = Math.round((this.value / totalIncome) * 100);     
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum += current.value;   
        });
        
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            //Unique ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
           
            // Creating new item basing on income or expense type
            if(type === 'expense') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'income') {
                newItem = new Income(ID, des, val);
            }
            
            //Push it into our data structure;
            data.allItems[type].push(newItem);
            
            
            //Return the new element
            return newItem;
        },
        
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
            
        },
        
        calculateBudget: function() {
            //calculate total income and expenses
            calculateTotal('expense');
            calculateTotal('income');
            
            //calculate the budget
            
            data.budget = data.totals.income - data.totals.expense;
            
            //calculate the percantage of income we spent
            if(data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        
        calculatePercentages: function() {
            data.allItems.expense.forEach(function(current){
                current.calcPercentage(data.totals.income);
            });
        },
        
        getPercentages: function(){
            var allPercentages = data.allItems.expense.map(function(current){
                return current.getPercentage();
            });
            return allPercentages;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncomes: data.totals.income,
                totalExpenses: data.totals.expense,
                percentage: data.percentage               
            }
        },
        
        testing: function() {
            console.log(data);
        }
        
    };
    
})();


// UI Controller
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetIncome: '.budget__income--value',
        budgetExpense: '.budget__expenses--value',
        expensePercentageTotal: '.budget__expenses--percentage',
        totalBudget: '.budget__value',
        container: '.container',
        expensePercentageItem: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
        var numSplit, integerPart, decimalPart, type;
            
        num = Math.abs(num);
        num = num.toFixed(2);
            
            
        numSplit = num.split(".");
        integerPart = numSplit[0];
        if(integerPart.length > 3) {
            integerPart = integerPart.substr(0, integerPart.length - 3) + ' ' + integerPart.substr(integerPart.length - 3, 3);
        }
            
        decimalPart = numSplit[1];
            
        return (type === 'expense' ? '-' : '+') + ' ' + integerPart + ',' + decimalPart;
    };
    
    
    var nodeListForEach = function(list, callback) {
                
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
                
    };
    
    
    return {
        getInput: function() {
            
            var inputValue = document.querySelector(DOMstrings.inputValue).value;
            inputValue = inputValue.replace(',', '.');
            
            return {
                type: document.querySelector(DOMstrings.inputType).value,  // either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(inputValue)
            };
        },
        
        addListItem: function(obj, type) {
            
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            
            if(type === 'income'){
                
                element = DOMstrings.incomeContainer;
            
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            } else if(type === 'expense') {
                
                element = DOMstrings.expenseContainer;
            
                html ='<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }
            
            // Replace the placeholder text with some actual data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            
        },
        
        
        deleteListItem: function(selectorID){
            var el;
            
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        
        
        clearFields: function(){
           var fields, fieldsArray;
            
           fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
           fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArray[0].focus();
            
        },
        
        displayBudget: function(budget) {
            var type;
            budget.budget > 0 ? type = 'income' : type = 'expense';
            
            document.querySelector(DOMstrings.budgetIncome).textContent = formatNumber(budget.totalIncomes, 'income');
            document.querySelector(DOMstrings.budgetExpense).textContent = formatNumber(budget.totalExpenses, 'expense');
            document.querySelector(DOMstrings.totalBudget).textContent = formatNumber(budget.budget, type);
            
            if(budget.percentage > 0) {
                document.querySelector(DOMstrings.expensePercentageTotal).textContent = budget.percentage + '%';
            } else {
                document.querySelector(DOMstrings.expensePercentageTotal).textContent = '---';
            }
                
        },
        
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensePercentageItem);
            console.log(fields);
            
            
            nodeListForEach(fields, function(current, index) {
                            
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, year, month, months;
            now = new Date();
            
            months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue );
            
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
    
})();


//Global App Controller
var controller = (function(budgeCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
        
            if(event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
                
            }     
        }); 
        
        //Event delegation - deleting the income or expense
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        //Event change
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    var updateBudget = function() {
        // 1. Calculate the budget
        
        budgeCtrl.calculateBudget();
        
        // 2. Return the budget
        
        var budget = budgeCtrl.getBudget();
        
        // 3. Display the budget on the UI
        
        UICtrl.displayBudget(budget);
        //console.log(budget);
           
    };
    
    var updatePercentages = function() {
        
        //1. Calculate percentage
        budgeCtrl.calculatePercentages();
        
        //2. Read percentages from the budget controller
        var percentages = budgeCtrl.getPercentages();
        
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        
        
    };
    
    
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the filed input data
        
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgeCtrl.addItem(input.type, input.description, input.value);
        
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            UICtrl.clearFields();
        
            // 4. Calc and update Budget
            updateBudget();
             
            //5. Calc and update Percentages
            updatePercentages();
            
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. Deleting item from data
            budgeCtrl.deleteItem(type, ID);
            
            
            //2. Delete the item from UI
            UICtrl.deleteListItem(itemID);
            
            
            //3. Update and show the new budget
            updateBudget(); 
            
            
            //4. Calc and update Percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncomes: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();