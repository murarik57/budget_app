//=====================Budget Controller module==================================

var budgetController=(function(){
    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    
    var Expenses=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    
    Expenses.prototype.calcPercentage=function(totalInc){
        if(totalInc>0)
            this.percentage=Math.round((this.value/totalInc)*100);
        else
            this.percentage=-1;
    };
    
    Expenses.prototype.getPerc=function(){
        return this.percentage;
    };
     
    var data={
        allItems:{
            inc: [],
            exp: []
        },
        totals:{
            inc: 0,
            exp: 0,
        },
        budget:0,
        percentage:0
    };
    
    var totalBudget=function(type){
        var sum=0;
        data.allItems[type].forEach(function(current){
            sum+=current.value;
        });
        data.totals[type]=sum;
    };
    
    return {
        addItem:function(type,des,value){
            var newItem,ID;
            //Create new id
            
            if(data.allItems[type].length>0)
                ID=data.allItems[type][data.allItems[type].length-1].id + 1;
            else
                ID=0;
            //Create new item based on type
            
            if(type==='inc')
                newItem=new Income(ID,des,value);
            else if(type==='exp')
                newItem=new Expenses(ID,des,value);
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem:function(type,id){
            var ids,index;
            //[1 2 4 6 8] del id 6
            //index=3
            //we cannot use data.allItems[type][id]
            ids = data.allItems[type].map(function(current){
                return current.id; 
             });
            index=ids.indexOf(id);
            if(index!==-1){
                data.allItems[type].splice(index,1);
            }
        },
        
        calculateBudget:function(){
            //calculate total income and expenses
            totalBudget('inc');
            totalBudget('exp');
            
            //Calculate total budget :income-expenses
            data.budget=data.totals.inc-data.totals.exp;
    
            
            //Calculate the percentage of income that we spent
            if(data.totals.inc>0)
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            else
                data.percentage=-1;         
            
        },
        
        calculatePercentage:function(){
            var perc;
            perc=data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentage:function(){
            var percentages;
            percentages=data.allItems.exp.map(function(cur){
            return cur.getPerc();
          });
            return percentages;
        },
        
        getBudget:function(){
          return {
              budget:data.budget,
              totalInc:data.totals.inc,
              totalExp:data.totals.exp,
              percentage:data.percentage
          };  
        },
        
        testing:function(){
            return data;
        }
    };
})();



//===================UI Controller module========================================



var UIController=(function(){
    var DOMstring={
        inputType: '.add__type', 
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer:'.income__list',
        expensesContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expensesLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        percentage:'.item__percentage',
        month:'.budget__title--month'
    };
    var formatNumber=function(num,type){
        var numSplit,int,dec,type;
        
        num=Math.abs(num);
        num=num.toFixed(2);
        numSplit=num.split('.');
        int=numSplit[0];
        if(int.length>3)
            int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        
        dec=numSplit[1];
        
        return (type === 'exp' ? '- ' : '+ ')+int+'.'+dec;
    };
    
    var nodeListforEach=function(list,callback){
                for(var i=0;i<list.length;i++){
                    callback(list[i],i);
                }
    };
    
    return {
        getInput:function(){
            return {
                type:document.querySelector(DOMstring.inputType).value,
                description:document.querySelector(DOMstring.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstring.inputValue).value)
            };
        },
        
        addListItem:function(obj,type){
            var html,newHtml,element;
            //Create html string with placeholder text
            
            if(type==='inc'){
                element=DOMstring.incomeContainer;
                
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }else if(type==='exp'){
                element=DOMstring.expensesContainer;
                
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            //Replace the plcaholder text with actual data
            
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem:function(selectorId){
            var el=document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        
        clearFields:function(){
            var fields;
            fields=document.querySelectorAll(DOMstring.inputDescription+','+DOMstring.inputValue);  
            fields.forEach(function(current){
                current.value="";
            });
            fields[0].focus();
        },
        
        displayBudget:function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstring.budgetLabel).textContent=formatNumber(obj.budget, type);
            document.querySelector(DOMstring.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstring.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage>0)
                document.querySelector(DOMstring.percentageLabel).textContent=obj.percentage+'%';
            else
                document.querySelector(DOMstring.percentageLabel).textContent='---'
        },
        
        displayPercentages:function(percentages){
            var fields=document.querySelectorAll(DOMstring.percentage);
                
            nodeListforEach(fields,function(current,index){
                if(percentages[index]>0)
                    current.textContent=percentages[index]+'%';
                else
                    current.textContent='---';
                
            });
            
        },
        displayMonth:function(){
            var now,year,month,list;
            now=new Date();
            list=['January','February','March','April','May','June','July','August','September','October','November','December']
            year=now.getFullYear();
            month=now.getMonth();
            document.querySelector(DOMstring.month).textContent=list[month]+' '+year;
        },
        changeColor:function(){
            var fields=document.querySelectorAll(
                DOMstring.inputType+','+
                DOMstring.inputDescription+','+
                DOMstring.inputValue        
            );
            nodeListforEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstring.inputButton).classList.toggle('red');
        },
        
        getDOMstring:function(){
            return DOMstring;
        }
    };
    
})();



//===================Global App Controller module==================================


var controller=(function(budgetCtrl,UICtrl){
    //Initialization
    var setupEventListner=function(){
        var DOM=UICtrl.getDOMstring();
        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
        if(event.code==='Enter')
            ctrlAddItem();         
        });
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeColor);
    };
    
    var updateBudget=function(){
        //Calculate the Budget
        budgetCtrl.calculateBudget();
        
        //Return the Budget
        var budget=budgetCtrl.getBudget();
        
        //Display the budget to the UI
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentage=function(){
        //Calculate the percentages
        budgetCtrl.calculatePercentage();
        
        //Return the Percentage
        var percent=budgetCtrl.getPercentage();
        
        //Display the Percentages to the UI
        UICtrl.displayPercentages(percent);
        
    };
    
    var ctrlAddItem=function(){
        var input,newItem;
        //Get the Field Input Data
        input=UICtrl.getInput();
        if(input.description!=="" && !isNaN(input.value)&&input.value>0){
            //Add the item to the budget controller
            newItem=budgetCtrl.addItem(input.type,input.description,input.value);
        
            //Add the item to the UI
            UICtrl.addListItem(newItem,input.type);
        
            //Clear the fields
            UICtrl.clearFields();
        
            //Calculate and update the Budget
            updateBudget();
            
            //Calculate and Upadte the percentage
            updatePercentage();
        }
         
    };
    
    var ctrlDeleteItem=function(event){
        var itemId,item,type,ID;
        itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId){
            
            item=itemId.split('-');
            type=item[0];
            ID=parseInt(item[1]);
            
            //Delete the item from the data structure
            budgetCtrl.deleteItem(type,ID)
            
            //Delete the item from the UI
            UICtrl.deleteListItem(itemId);
            
            //Update and show the new budget
            updateBudget();
            
            //Calculate and Upadte the percentage
            updatePercentage();
            
        }
    };
    
    return {
        init:function(){
            setupEventListner();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
              budget:0,
              totalInc:0,
              totalExp:0,
              percentage:-1
          });
        }
    };
})(budgetController,UIController);

controller.init();