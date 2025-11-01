// fetch and display random joke on button click
document.getElementById("btn-random").addEventListener("click", async () => {
    try {
        let res = await fetch("/jokebook/random");
        let data = await res.json();
        if (data.length > 0) {
            document.getElementById("joke-category").textContent = "Category: " + data[0].category;
            document.getElementById("random-joke").textContent = data[0].setup;
            document.getElementById("joke-delivery").textContent = "Guess the punchline...";
            setTimeout(() => {
                document.getElementById("joke-delivery").textContent = data[0].delivery;
            }, 2000);
        } else {
            document.getElementById("random-joke").textContent = "No joke found!";
        }
    } catch (err) {
        document.getElementById("random-joke").textContent = "Error loading joke!";
        console.error(err);
    }
});



// display categories by clicking on category name
let isVisible = false;
document.getElementById("load-categories").addEventListener("click", async () => {
    let res = await fetch("/jokebook/categories");
    let data = await res.json();
    let list = document.getElementById("categories-list");
    list.innerHTML = "";
    if (isVisible) {
        list.innerHTML = "";
        document.getElementById("click-category").innerHTML = "";
        isVisible = false;
    } else {

        data.forEach(cat => {
            let li = document.createElement("ul");
            li.textContent = cat.category;
            li.style.cursor = "pointer";

            li.addEventListener("click", async () => {
                try {
                    let url = "/jokebook/category/" + cat.category;
                    let res = await fetch(url);
                    let jokes = await res.json();

                    let output = document.getElementById("click-category");
                    output.innerHTML = "";

                    if (Array.isArray(jokes) && jokes.length > 0) {
                        jokes.forEach(j => {
                            let p = document.createElement("p");
                            let p1 = document.createElement("p");
                            p.textContent = "SetUp: " + j.setup;
                            p1.textContent = "Delivery: " + j.delivery;
                            p1.id = "setup-punchline";
                            output.appendChild(p);
                            output.appendChild(p1);
                        });
                    } else {
                        output.textContent = "No jokes in this category.";
                    }
                } catch (err) {
                    console.error(err);
                }
            });

            list.appendChild(li);


        });
        isVisible = true;
    }
});

// fetch jokes by category with limit number of jokes
document.getElementById("search-category").addEventListener("click", async () => {
    category = document.getElementById("category-input").value;
    limit = document.getElementById("limit-input").value;

    if (!category) {
        document.getElementById("category-jokes").textContent = "Please enter a category!";
        return;
    }

    let url = "/jokebook/category/" + category; 
    if (limit) {
        url += "?limit=" + limit;
    }

    try {
        let res = await fetch(url);
        let data = await res.json();

        let output = document.getElementById("category-jokes");
        output.innerHTML = "";

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(j => {
                let p = document.createElement("p");
                let p1 = document.createElement("p");
                p.id = "setup-punchline";
                p.textContent = j.setup;
                p1.textContent = j.delivery;

                output.appendChild(p);
                output.appendChild(p1);
            });
        } else {
            output.textContent = data;
        }
    } catch (err) {
        console.error(err);
        document.getElementById("category-jokes").textContent = " Error fetching jokes.";
    }
});



async function showCategoryJokes(category) {
    let res = await fetch("/jokebook/category/" + category);
    let jokes = await res.json();

    // clear old table rows except header
    let table = id("joke-table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // fill table with only this category's jokes
    jokes.forEach(joke => {
        let tableRow = table.insertRow();
        // let idCell = tableRow.insertCell();
        let categoryCell = tableRow.insertCell();
        let setupCell = tableRow.insertCell();
        let deliveryCell = tableRow.insertCell();

        categoryCell.textContent = category;
        setupCell.textContent = joke.setup;
        deliveryCell.textContent = joke.delivery;
    });
}

let saveButton = id("add-joke");
saveButton.addEventListener("click", function (e) {
    e.preventDefault();
    submitForm();
});

function submitForm() {
    let params = new FormData(id("form-container"));
    let jsonBody = JSON.stringify(Object.fromEntries(params)); 
    fetch("/jokebook/joke/add", {
        method: "POST",
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
        },
        body: jsonBody,
    })
        .then(checkStatus)
        .then(data => {
            let addedCategory = data[0].category;
            showCategoryJokes(addedCategory);
            clearTable();
        })
        .catch(err => console.error(" Error adding joke:", err));
}

function clearTable() {
    id("form-container").reset();
}


function id(idName) {
    return document.getElementById(idName);
}
function checkStatus(response) {
    if (!response.ok) {
        throw Error("Error in request: " + response.statusText);
    }
    return response.json();
}




