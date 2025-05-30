// ----- START OF CLASS-LIST.JS -----
(() =>{
    fetch("/api/class-list")
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("class-list-body");
            list.innerHTML = "";
            data.forEach(cls => {
            const li = document.createElement("li");
            li.textContent = `${cls.class_code} - ${cls.class_name}`;
            list.appendChild(li);
        });
    });
})();
// ----- END OF CLASS-LIST.JS -----