let leftValue=100;
let rightValue=0;

let leftInput=document.querySelector(".right-to-left");
let rightInput=document.querySelector(".left-to-right");

if(leftInput) {

    leftInput.addEventListener('click',function() {
        if(leftValue>0) {
            leftValue--;
            rightValue++;
            document.querySelector(".left-basket span").textContent=leftValue;
            document.querySelector(".right-basket span").textContent=rightValue;

        }

    })
}
if(rightInput) {

    rightInput.addEventListener('click',function() {
        if(rightValue>0) {
            rightValue--;
            leftValue++;
            document.querySelector(".left-basket span").textContent=leftValue;
            document.querySelector(".right-basket span").textContent=rightValue;

        }


    })
}




