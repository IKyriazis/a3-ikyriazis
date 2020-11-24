// stores all the titles of the current posts
let postTitles = [];

// loads all posts into the post-container div
async function loadDB() {
    // gets dom element for post container
    let posts = document.getElementById("post-container");
    // empties the post container
    posts.innerHTML = "";

    // gets all the post data from the server
    await fetch('/loadData').then(result => result.json().then(result => {
        result.forEach((post) => {
            // adds the post title to the array
            postTitles.push(post.title);
            // adds a new post into the post container
            posts.innerHTML += `
        <div align="center" class="post">
        <h3>${post.title}</h3>
        <img height = "400px" width = "400px" src="${post.image}">
        <div class="buyinginfo"><p>This item was sol on ${post.date}</p> <div></div>
        <p>$${post.price}.00</p><div></div></div>
        <div style="margin-top: 20px;" id="${post.title}commentsection"><button id="viewcomments${post.title}">View comments</button></div>
        <div class="addcomment"><div></div><input type="text" id="${post.title}commentbox" placeholder="Add a comment..."><button id="${post.title}commentbutton">Submit</button> <div></div></div>
        </div>
        `
        })
    }));

}
// when all the posts are loaded into the html then add event listeners to view comment buttons and stuff
window.onload = () => loadDB().then(result => {
    // holds all the view comment buttons
    let commentButtons = [];
    // holds all the submit comment buttons
    let postCommentButtons = [];
    // holds all the text boxes for adding comments
    let commentTextBoxes = [];
    // goes through all posts and adds the event listeners
    for (let i = 0; i < postTitles.length; i++) {
        // gets the view comment button for current post
        commentButtons[i] = document.getElementById('viewcomments' + postTitles[i]);
        // gets the submit comment button for current post
        postCommentButtons[i] = document.getElementById(postTitles[i] + 'commentbutton');
        // gets the text box for adding comment for current post
        commentTextBoxes[i] = document.getElementById(postTitles[i] + 'commentbox');
        // submitting comment
        postCommentButtons[i].addEventListener('click', function () {
            fetch('/addcomment', {
                method: "POST",
                body: JSON.stringify({title: postTitles[i], text: commentTextBoxes[i].value}),
                headers: {'Content-Type': 'application/json'}
            }).then(res => {
                res.json().then(res => {
                    if (!res.successful) {
                        alert("Must be logged in to comment");
                    }
                    else {
                        alert("Comment posted, refresh page to view");
                    }
                })
            })
        });
        // the show comments button
        commentButtons[i].addEventListener('click', function () {
            // get the comment section for current post
            let commentSection = document.getElementById(postTitles[i] + 'commentsection');
            // send a post request with the post's current title
            fetch('/loadcomments', {
                method: "POST",
                body: JSON.stringify({title: postTitles[i]}),
                headers: {'Content-Type': 'application/json'}
            }).then(result => result.json()).then(result => {
                commentSection.innerHTML = "";
                result.forEach((comment) => {
                    // when the server sends back all the comments go through them and
                    // add them as p elements
                    let pElement = document.createElement("p");
                    pElement.innerText = comment.text;
                    commentSection.appendChild(pElement);
                })
                });
            // if (commentButtons[i].innerHTML === 'View Comments') {
            //     debugger
            //     // clear the html
            //     commentSection.innerHTML = "";
            //     // send a post request with the post's current title
            //     fetch('/loadcomments', {
            //         method: "POST",
            //         body: JSON.stringify({title: postTitles[i]}),
            //         headers: {'Content-Type': 'application/json'}
            //     }).then(result => result.json()).then(result => {
            //         result.forEach((comment) => {
            //             // when the server sends back all the comments go through them and
            //             // add them as p elements
            //             let pElement = document.createElement("p");
            //             pElement.innerText = comment.text;
            //             commentSection.appendChild(pElement);
            //         })
            //         let button = document.createElement("button");
            //         button.innerHTML = 'Hide Comments';
            //         commentSection.appendChild(button);
            //     })
            // } else {
            //     commentSection.innerHTML = '';
            //     let button = document.createElement("button");
            //     button.innerHTML = 'View Comments';
            //     commentSection.appendChild(button);
            // }
        })
    }
});

// fetch("/getusername", {
//     method: "GET"
// }).then((result) => {
//     document.getElementById("username").innerHTML = result.username;
// });
// does stuff for logging in, not where i want it to be yet
const register = document.getElementById("register");
const login = document.getElementById("login");
let user = document.getElementById("user");
const pass = document.getElementById("pass");
register.addEventListener("click", function () {
    fetch("/register", {
        method: "POST",
        body: JSON.stringify({username: user.value, password: pass.value}),
        headers: {'Content-Type': 'application/json'}
    }).then(res => {
        res.json().then(res => {
            if (res.successful === true) {
                alert("Account was created");
            }
            else {
                alert("Account creation failed");
            }
        })
    })
});
login.addEventListener("click", function () {
    fetch("/login", {
        method: "POST",
        body: JSON.stringify({username: user.value, password: pass.value}),
        headers: {'Content-Type': 'application/json'}
    }).then((result) => {
        result.json().then(result => alert(result.message));
    })
});
// let mycomments = document.getElementById("viewmycomments");
// let displaymycomments = document.getElementById("mycomments");
// mycomments.addEventListener("click", () => {
//     fetch("/getmycomments").then(res => res.json()).then(res => {
//         res.forEach((comment) => {
//             let p = document.createElement("p");
//             p.innerText = comment.text;
//             displaymycomments.appendChild(p);
//         })
//     })
// })