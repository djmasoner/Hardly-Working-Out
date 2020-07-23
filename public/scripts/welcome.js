var workoutBtn = document.getElementById("workout-btn");
var navList = document.getElementById("nav-list");

workoutBtn.addEventListener("click", displayList);
navList.addEventListener("mouseleave", hideList);

function displayList() {
    var list = document.getElementById("nav-list");
    list.style.pointerEvents = "all";
};

function hideList() {
    var list = document.getElementById("nav-list");
    list.style.pointerEvents = "none";
}
