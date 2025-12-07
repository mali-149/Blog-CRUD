< !DOCTYPE html >
    <html>
        <head>
            <meta charset="utf-8">
                <title>Advanced Blog</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body{margin:0;background:#f3f4f6;font-family:sans-serif}
                        nav{background:#111827;color:#fff;padding:15px;display:flex;justify-content:space-between;align-items:center}
                        nav a,nav button{color:#fff;text-decoration:none;background:none;border:none;font-size:16px;margin-left:10px;cursor:pointer}
                        .container{max - width:850px;margin:20px auto;padding:10px}
                        .card{background:#fff;padding:20px;border-radius:10px;margin-bottom:20px;box-shadow:0 2px 5px rgba(0,0,0,.1)}
                        input,textarea,select{width:100%;padding:10px;margin-top:8px;margin-bottom:15px;border:1px solid #ddd;border-radius:8px;font-size:15px}
                        button{padding:10px 20px;border:none;border-radius:8px;background:#2563eb;color:#fff;font-size:16px;cursor:pointer}
                        .flex{display:flex;justify-content:space-between;align-items:center}
                        .badge{padding:4px 10px;background:#2563eb;color:#fff;border-radius:6px;font-size:12px}
                        .tag{display:inline-block;background:#e5e7eb;padding:4px 8px;border-radius:6px;font-size:12px;margin-right:5px}
                        textarea{height:150px}
                        .hidden{display:none}
                        .post-img{max - width:100%;border-radius:10px;margin:10px 0}
                        .comment-box{margin - top:20px;padding:15px;background:#f9fafb;border-radius:10px}
                        .comment{padding:10px;background:#fff;border-radius:8px;margin-top:10px;border:1px solid #eee}
                        .pagination{display:flex;justify-content:center;margin-top:20px}
                        .pagination button{margin:0 5px}
                    </style>
                </head>
                <body>

                    <nav>
                        <div id="nav-left">
                            <a href="#" onclick="showHome()">Home</a>
                            <a href="#" onclick="showDashboard()" id="dashLink" class="hidden">Dashboard</a>
                        </div>
                        <div id="nav-right">
                            <span id="userLabel"></span>
                            <button onclick="showLogin()" id="loginBtn">Login</button>
                            <button onclick="logout()" id="logoutBtn" class="hidden">Logout</button>
                        </div>
                    </nav>

                    <div class="container">

                        <div id="home"></div>

                        <div id="auth" class="hidden">
                            <div class="card">
                                <h2 id="authTitle"></h2>
                                <input id="authName" placeholder="Name">
                                    <input id="authEmail" placeholder="Email">
                                        <input id="authPassword" type="password" placeholder="Password">
                                            <select id="authRole">
                                                <option value="reader">Reader</option>
                                                <option value="author">Author</option>
                                            </select>
                                            <button onclick="submitAuth()" id="authSubmit"></button>
                                            <p><a href="#" onclick="toggleAuth()">Switch</a></p>
                                        </div>
                                    </div>

                                    <div id="dashboard" class="hidden">
                                        <div class="card">
                                            <h2>Your Posts</h2>
                                            <button onclick="showPostForm()">Create Post</button>
                                            <div id="dashPosts"></div>
                                        </div>
                                    </div>

                                    <div id="postForm" class="hidden">
                                        <div class="card">
                                            <h2 id="formTitle"></h2>
                                            <input id="postTitle" placeholder="Title">
                                                <select id="postCategory"></select>
                                                <input id="postTags" placeholder="Tags (comma separated)">
                                                    <input type="file" id="postImage">
                                                        <textarea id="postContent" placeholder="Content"></textarea>
                                                        <select id="postStatus">
                                                            <option value="draft">Draft</option>
                                                            <option value="published">Published</option>
                                                        </select>
                                                        <button onclick="savePost()">Save</button>
                                                        <button onclick="cancelPost()">Cancel</button>
                                                    </div>
                                                </div>

                                                <div id="detail" class="hidden"></div>

                                        </div>

                                        <script>
                                            let users=JSON.parse(localStorage.getItem("users")||"[]")
                                            let posts=JSON.parse(localStorage.getItem("posts")||"[]")
                                            let comments=JSON.parse(localStorage.getItem("comments")||"[]")
                                            let currentUser=JSON.parse(localStorage.getItem("currentUser")||"null")
                                            let editingPost=null
                                            let authMode="login"
                                            let currentPage=1

                                            function saveDB(){
                                                localStorage.setItem("users", JSON.stringify(users))
localStorage.setItem("posts",JSON.stringify(posts))
                                            localStorage.setItem("comments",JSON.stringify(comments))
                                            localStorage.setItem("currentUser",JSON.stringify(currentUser))
}

                                            function slugify(t){return t.toLowerCase().replace(/ /g,"-").replace(/[^\w-]+/g,"")}

                                            function showHome(){
                                                hideAll()
renderHome()
                                            document.getElementById("home").classList.remove("hidden")
}

                                            function renderHome(){
                                                let q=""
                                            if(document.getElementById("searchInput"))q=document.getElementById("searchInput").value.toLowerCase()
                                            let perPage=5
let filtered=posts.filter(p=>p.status==="published"&&(p.title.toLowerCase().includes(q)||p.content.toLowerCase().includes(q)))
                                            let totalPages=Math.ceil(filtered.length/perPage)
                                            let shown=filtered.slice((currentPage-1)*perPage,currentPage*perPage)
                                            let html=`<div class='card'><input id='searchInput' placeholder='Search...' oninput='renderHome()'></div>`
shown.forEach(p=>{
                                                html += `<div class='card' onclick="showDetail('${p.slug}')">
<h2>${p.title}</h2>
<div class='badge'>${p.category}</div>
<div>${p.tags.split(",").map(t => `<span class='tag'>${t.trim()}</span>`).join("")}</div>
<p>${p.content.substring(0, 120)}...</p>
</div>`
                                            })
                                            html+=`<div class='pagination'>`
if(currentPage>1)html+=`<button onclick='changePage(-1)'>Prev</button>`
                                                if(currentPage<totalPages)html+=`<button onclick='changePage(1)'>Next</button>`
                                                html+=`</div>`
                                            document.getElementById("home").innerHTML=html
}

                                            function changePage(step){currentPage += step;renderHome()}

                                            function showDetail(slug){
                                                hideAll()
let p=posts.find(x=>x.slug===slug)
let postComments=comments.filter(c=>c.postId===p.id)
                                            let html=`<div class='card'>
                                                <h1>${p.title}</h1>
                                                <div class='badge'>${p.category}</div>
                                                ${p.image ? `<img src='${p.image}' class='post-img'>` : ""}
                                                <div>${p.tags.split(",").map(t => `<span class='tag'>${t.trim()}</span>`).join("")}</div>
                                                <p>${p.content}</p>
                                            </div>`

                                            html+=`<div class='card comment-box'>
                                                <h3>Comments</h3>`
postComments.forEach(c=>{
if(c.approved||currentUser?.role==="admin"||currentUser?.id===p.authorId)
                                                html+=`<div class='comment'><b>${c.userName}</b><br>${c.content}
                                                    ${(currentUser?.role === "admin" || currentUser?.id === p.authorId) && !c.approved ? `<button onclick="approveComment(${c.id})">Approve</button>` : ""}
                                                </div>`
})
                                                if(currentUser)
                                                html+=`<textarea id='commentText' placeholder='Write comment...'></textarea><button onclick="addComment(${p.id})">Post</button>`
                                                html+=`</div>`
                                            document.getElementById("detail").innerHTML=html
                                            document.getElementById("detail").classList.remove("hidden")
}

                                            function addComment(postId){
                                                let txt=document.getElementById("commentText").value
                                            comments.push({id:Date.now(),postId,userId:currentUser.id,userName:currentUser.name,content:txt,approved:false})
                                            saveDB()
showDetail(posts.find(x=>x.id===postId).slug)
}

                                            function approveComment(id){
                                                let c=comments.find(x=>x.id===id)
                                            c.approved=true
                                            saveDB()
showDetail(posts.find(x=>x.id===c.postId).slug)
}

                                            function showLogin(){
                                                hideAll()
authMode="login"
                                            document.getElementById("authTitle").textContent="Login"
                                            document.getElementById("authRole").style.display="none"
                                            document.getElementById("authSubmit").textContent="Login"
                                            document.getElementById("auth").classList.remove("hidden")
}

                                            function showRegister(){
                                                hideAll()
authMode="register"
                                            document.getElementById("authTitle").textContent="Register"
                                            document.getElementById("authRole").style.display="block"
                                            document.getElementById("authSubmit").textContent="Register"
                                            document.getElementById("auth").classList.remove("hidden")
}

                                            function toggleAuth(){authMode === "login" ? showRegister() : showLogin()}

                                            function submitAuth(){
                                                let n=document.getElementById("authName").value
                                            let e=document.getElementById("authEmail").value
                                            let p=document.getElementById("authPassword").value
                                            if(authMode==="register"){
                                                users.push({ id: Date.now(), name: n, email: e, password: p, role: document.getElementById("authRole").value })
saveDB()
                                            alert("Registered")
                                            showLogin()
}else{
                                                let u=users.find(x=>x.email===e&&x.password===p)
                                            if(!u)return alert("Invalid")
                                            currentUser=u
                                            saveDB()
                                            updateNav()
                                            showHome()
}
}

                                            function logout(){
                                                currentUser = null
saveDB()
                                            updateNav()
                                            showHome()
}

                                            function updateNav(){
                                                document.getElementById("userLabel").textContent = currentUser ? currentUser.name : ""
document.getElementById("loginBtn").classList.toggle("hidden",!!currentUser)
                                            document.getElementById("logoutBtn").classList.toggle("hidden",!currentUser)
                                            document.getElementById("dashLink").classList.toggle("hidden",!currentUser||currentUser.role==="reader")
}

                                            function showDashboard(){
                                                hideAll()
let my=posts.filter(p=>p.authorId===currentUser.id)
                                            let html=``
my.forEach(p=>{
                                                html += `<div class='card'><h3>${p.title}</h3>
<button onclick="editPost(${p.id})">Edit</button>
<button onclick="deletePost(${p.id})">Delete</button>
</div>`
                                            })
                                            document.getElementById("dashPosts").innerHTML=html
                                            document.getElementById("dashboard").classList.remove("hidden")
}

                                            function showPostForm(){
                                                hideAll()
editingPost=null
                                            document.getElementById("formTitle").textContent="Create Post"
                                            loadCategories()
                                            document.getElementById("postForm").classList.remove("hidden")
}

                                            function editPost(id){
                                                hideAll()
editingPost=posts.find(p=>p.id===id)
                                            document.getElementById("formTitle").textContent="Edit Post"
                                            loadCategories(editingPost.category)
                                            document.getElementById("postTitle").value=editingPost.title
                                            document.getElementById("postTags").value=editingPost.tags
                                            document.getElementById("postContent").value=editingPost.content
                                            document.getElementById("postStatus").value=editingPost.status
                                            document.getElementById("postForm").classList.remove("hidden")
}

                                            function loadCategories(selected=""){
                                                let cats=["Technology","Business","Lifestyle","Travel","Fashion"]
                                            let html=""
cats.forEach(c=>html+=`<option ${c === selected ? "selected" : ""}>${c}</option>`)
                                            document.getElementById("postCategory").innerHTML=html
}

                                            function savePost(){
                                                let t=document.getElementById("postTitle").value
                                            let c=document.getElementById("postCategory").value
                                            let tg=document.getElementById("postTags").value
                                            let cnt=document.getElementById("postContent").value
                                            let st=document.getElementById("postStatus").value
                                            let imgInput=document.getElementById("postImage")
                                            if(editingPost){
                                                editingPost.title = t
editingPost.category=c
                                            editingPost.tags=tg
                                            editingPost.content=cnt
                                            editingPost.status=st
                                            if(imgInput.files[0])readerImage(editingPost)
                                            saveDB()
                                            showDashboard()
}else{
                                                let newPost={id:Date.now(),title:t,slug:slugify(t)+"-"+Date.now(),category:c,tags:tg,content:cnt,status:st,authorId:currentUser.id,image:""}
                                            if(imgInput.files[0])readerImage(newPost,true)
                                            else{posts.push(newPost);saveDB();showDashboard()}
}
}

                                            function readerImage(post,isNew=false){
                                                let r=new FileReader()
r.onload=e=>{
                                                post.image = e.target.result
if(isNew)posts.push(post)
                                            saveDB()
                                            showDashboard()
}
                                            r.readAsDataURL(document.getElementById("postImage").files[0])
}

                                            function deletePost(id){
                                                posts = posts.filter(p => p.id !== id)
saveDB()
                                            showDashboard()
}

                                            function cancelPost(){showDashboard()}

                                            function hideAll(){
                                                document.getElementById("home").classList.add("hidden")
document.getElementById("auth").classList.add("hidden")
                                            document.getElementById("dashboard").classList.add("hidden")
                                            document.getElementById("postForm").classList.add("hidden")
                                            document.getElementById("detail").classList.add("hidden")
}

                                            updateNav()
                                            showHome()
                                        </script>

                                    </body>
                                </html>
