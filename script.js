const STORAGE_KEY='blogPosts';
const COMMENT_KEY='blogComments';
let deleteId=null;

// CRUD Functions
function getPosts(){return JSON.parse(localStorage.getItem(STORAGE_KEY))||[];}
function savePosts(posts){localStorage.setItem(STORAGE_KEY,JSON.stringify(posts));}
function addPost(post){const posts=getPosts(); posts.push(post); savePosts(posts);}
function updatePost(updated){let posts=getPosts(); posts=posts.map(p=>p.id===updated.id?updated:p); savePosts(posts);}
function deletePost(id){let posts=getPosts(); posts=posts.filter(p=>p.id!==id); savePosts(posts);}
function getPostById(id){return getPosts().find(p=>p.id===id);}
function getComments(){return JSON.parse(localStorage.getItem(COMMENT_KEY))||[];}
function saveComments(comments){localStorage.setItem(COMMENT_KEY,JSON.stringify(comments));}
function addComment(comment){const comments=getComments(); comments.push(comment); saveComments(comments);}

// Render Posts Table
function renderPosts(){
const posts=getPosts();
const tbody=document.getElementById('postTable');
const search=document.getElementById('search').value.toLowerCase();
const statusFilter=document.getElementById('statusFilter').value;
tbody.innerHTML='';
posts.forEach(p=>{
    if((p.title.toLowerCase().includes(search)||p.content.toLowerCase().includes(search)) &&
       (statusFilter==='All'||p.status===statusFilter)){
        const tr=document.createElement('tr');
        const tagsHtml=p.tags.map(t=>`<span class="tag" onclick="filterByTag('${t}')">${t}</span>`).join(' ');
        tr.innerHTML=`<td><a href="#" onclick="openDetailModal(${p.id});return false;">${p.title}</a></td>
        <td>${p.author}</td>
        <td><span class="tag" onclick="filterByCategory('${p.category}')">${p.category}</span></td>
        <td>${p.status}</td>
        <td>${tagsHtml}</td>
        <td>
        <button class="editBtn" onclick="openPostModal(${p.id})">Edit</button>
        <button class="deleteBtn" onclick="openDeleteModal(${p.id})">Delete</button>
        </td>`;
        tbody.appendChild(tr);
    }
});
}
renderPosts();
document.getElementById('search').addEventListener('input',renderPosts);
document.getElementById('statusFilter').addEventListener('change',renderPosts);

// Post Modal
function openPostModal(id=null){
    const modal=document.getElementById('postModal');
    modal.style.display='block';
    if(id){
        const post=getPostById(id);
        document.getElementById('modalTitle').innerText='Edit Post';
        document.getElementById('postId').value=post.id;
        document.getElementById('title').value=post.title;
        document.getElementById('category').value=post.category;
        document.getElementById('tags').value=post.tags.join(',');
        document.getElementById('content').value=post.content;
        document.getElementById('status').value=post.status;
    }else{
        document.getElementById('modalTitle').innerText='Add Post';
        document.getElementById('postId').value='';
        document.getElementById('title').value='';
        document.getElementById('category').value='';
        document.getElementById('tags').value='';
        document.getElementById('content').value='';
        document.getElementById('status').value='Draft';
    }
}
function closePostModal(){document.getElementById('postModal').style.display='none';}
document.getElementById('savePost').addEventListener('click',()=>{
    const id= document.getElementById('postId').value;
    const title= document.getElementById('title').value;
    const category= document.getElementById('category').value;
    const tags= document.getElementById('tags').value.split(',').map(t=>t.trim());
    const content= document.getElementById('content').value;
    const status= document.getElementById('status').value;
    if(!title||!content) return alert('Title and Content required!');
    if(id){
        updatePost({id:Number(id),title,category,tags,content,status,author:'Author',updated_at:new Date().toLocaleString()});
    }else{
        addPost({id:Date.now(),title,category,tags,content,status,author:'Author',created_at:new Date().toLocaleString(),updated_at:new Date().toLocaleString()});
    }
    closePostModal(); renderPosts();
});

// Delete Modal
function openDeleteModal(id){ deleteId=id; document.getElementById('deleteModal').style.display='block'; }
document.getElementById('confirmDelete').addEventListener('click',()=>{ deletePost(deleteId); deleteId=null; document.getElementById('deleteModal').style.display='none'; renderPosts(); });
function closeDeleteModal(){ deleteId=null; document.getElementById('deleteModal').style.display='none'; }

// Post Detail Modal
function openDetailModal(id){
    const post=getPostById(id); if(!post) return;
    document.getElementById('detailTitle').innerText=post.title;
    document.getElementById('detailAuthor').innerText=post.author;
    document.getElementById('detailCategory').innerText=post.category;
    document.getElementById('detailContent').innerText=post.content;
    renderComments(id);
    document.getElementById('detailModal').style.display='block';
    document.getElementById('addCommentBtn').onclick=()=>{
        const content=document.getElementById('commentContent').value;
        if(!content) return alert('Enter comment!');
        addComment({postId:id,user:'Reader',content,created_at:new Date().toLocaleString()});
        document.getElementById('commentContent').value='';
        renderComments(id);
    };
}
function closeDetailModal(){document.getElementById('detailModal').style.display='none';}

function renderComments(postId){
    const comments=getComments().filter(c=>c.postId===postId);
    const list=document.getElementById('commentsList');
    list.innerHTML='';
    comments.forEach(c=>{
        const li=document.createElement('li');
        li.textContent=`${c.user}: ${c.content}`;
        list.appendChild(li);
    });
}

// Tag/Category Filters
function filterByTag(tag){ document.getElementById('search').value=tag; renderPosts(); }
function filterByCategory(cat){ document.getElementById('search').value=cat; renderPosts(); }

// Close modals on outside click
window.onclick=function(e){
    ['postModal','deleteModal','detailModal'].forEach(id=>{const m=document.getElementById(id); if(e.target===m) m.style.display='none';});
}
