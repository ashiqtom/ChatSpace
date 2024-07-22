//encapsulate the state within an object
const appState = {
    currentGroupId: null,
    currentGroupName: null,
    token: localStorage.getItem('token'),
    adminName: localStorage.getItem('adminName')
};

const socket = io({
    query: {
      token: appState.token
    }
});
//recive new Message notifocation from server
socket.on('newMessage', () => {
    getMessage();
});

document.getElementById('sendMessage').addEventListener('click', async () => {
    try {
        const token = appState.token;
        const messageInput = document.getElementById('message');
        const message = messageInput.value;
        const messageObj={
            message:message,
            groupId:appState.currentGroupId
        }
        if(message){
            await axios.post(`/chat/postChat`,messageObj,{headers:{"authorization":token}});
            messageInput.value=''
            getMessage();
        }
        messageInput.value = "";
    } catch (error) {
        console.log(error);
        alert('Failed to upload message')
    }
});


document.getElementById('uploadForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('myFile');
    const file = fileInput.files[0];

    if (!file) {
        return alert('Please select a file to upload');
    }

    const formData = new FormData();
    formData.append('myFile', file);
    formData.append('groupId', appState.currentGroupId);

    const token = appState.token;

    try {
        await axios.post(`/chat/uploadFile`,formData,{headers:{"authorization":token}});
        fileInput.value = '';
        getMessage();

    } catch (error) {
        console.error('error:', error);
        alert('Failed to upload file')
    }
});


const getMessage = async () =>{
    try {
        const token = appState.token;
        const groupId=appState.currentGroupId;

        const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
        const filteredMessages = storedMessages.filter(message => message.groupId === groupId);
        lastMessageId = filteredMessages.length !== 0 ? filteredMessages[filteredMessages.length - 1].id : 0;

        const getMessages = await axios.get(`/chat/getChat/${lastMessageId}/${groupId}`, { headers: { 'authorization': token } });
        const newMessages = getMessages.data;

        const updatedMessages = storedMessages.concat(newMessages.filter(item2 => {
            return !storedMessages.some(item1 => item1.id === item2.id);
        }));

        localStorage.setItem('messages', JSON.stringify(updatedMessages));

        const filteredChat = updatedMessages.filter(message => message.groupId === groupId);
        messageDivFunction(filteredChat);
    } catch (error) {
        console.log(error);
    }
}

const messageDivFunction = (messages) => {
    document.getElementById('loggedUsersList').innerHTML='';
    document.getElementById('addMembersList').innerHTML='';
    document.getElementById('groupMemberslist').innerHTML='';

    const messageList = document.getElementById('allMessage');
    messageList.innerHTML = ''; 

    messages.forEach(message => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const li = document.createElement('li');
        
        const contentWithLinks = message.chat.replace(urlRegex, (url) => {
            if (url.match(/\.(jpeg|jpg|gif|png)$/i)) {
                return `<img src="${url}" alt="image" style="max-width: 200px; max-height: 200px;">`;
            } else {
                return `<a href="${url}" target="_blank">click</a>`;
            }
        });

        li.innerHTML = `${message.name} - ${contentWithLinks}`;
        messageList.appendChild(li);
    });
}

document.getElementById('addMembers').addEventListener('click',async () => {
    try {
        const users = await axios.get(`/group/userList/${appState.currentGroupId}`);
       
        const userList = document.getElementById('addMembersList');
        userList.innerHTML = '';
        users.data.forEach(user => {
            if (user.username !== appState.adminName) {
                const li = document.createElement('li');
                li.textContent = user.username;
                const addUser = document.createElement('button');
                addUser.innerHTML = 'add';
                addUser.addEventListener('click', async () => {
                    try {
                        const token = appState.token;
                        const response = await axios.post(`/group/addMembers`, {
                            groupName: appState.currentGroupName,
                            username: user.username
                        }, { headers: { 'authorization': token } });
                        alert(response.data.message)
                        getMessage();
                    } catch (error) {
                        console.log(error);
                        alert('Faild to add Member')
                    }
                });
                li.appendChild(addUser)
                userList.appendChild(li);
            }
        });
    } catch (error) {
        console.log(error);
        alert("failed")
    }
});

document.getElementById('showLoggedUsers').addEventListener('click', async () => {
    const token = appState.token;
    try {
        const response = await axios.get(`/user/getloggedUser/${appState.currentGroupId}`, { headers: { 'authorization': token } });
        const loggedUsers = response.data;
        const userList = document.getElementById('loggedUsersList');
        userList.innerHTML = ''; 
        loggedUsers.forEach(username => {
            const listItem = document.createElement('li');
            listItem.textContent = username;
            userList.appendChild(listItem);
        });
    } catch (error) {
        console.error(error);
        alert('Faild to load Member')
    }
});

document.getElementById('groupMembers').addEventListener('click', async () => {
    try {
        const token = appState.token;
        const groups = await axios.get(`/group/groupMembers/${appState.currentGroupName}`, { headers: { 'authorization': token } });
        const groupList = document.getElementById('groupMemberslist');
        groupList.innerHTML = '';
        groups.data.forEach(group => { 
            const listItem = document.createElement('li');
            if(group.username===appState.adminName && group.Admin){
                listItem.innerHTML = `${group.username} - You - Admin`;

            } else if (group.username===appState.adminName){
                listItem.innerHTML = `${group.username} - You`;
            } else if (group.Admin){
                listItem.innerHTML = `${group.username}- Admin`;
            } else {
                listItem.innerHTML = `${group.username}`;
                const addAdmin = document.createElement('button');
                addAdmin.innerHTML = 'addAdmin';
                addAdmin.addEventListener('click', async () => {
                    try {
                        const token = appState.token;
                        const promoteToAdmin = await axios.post(`/group/promoteToAdmin`, {
                            groupName: appState.currentGroupName,
                            username: group.username
                        }, { headers: { 'authorization': token } });
                        getMessage();
                    } catch (error) {
                        console.log(error.response.data.message);
                        alert('failed')
                    }
                });
                listItem.appendChild(addAdmin);

                const removeUser = document.createElement('button');
                removeUser.innerHTML = 'Remove';
                removeUser.addEventListener('click', async () => {
                    try {
                        const response = await axios.post(`/group/removeUser`, {
                            groupName: appState.currentGroupName,
                            username: group.username
                        }, { headers: { 'authorization': token } });
                        alert(response.data.message)
                        getMessage();
                    } catch (error) {
                        console.log(error.response.data.message);
                        alert('failed')
                    }
                });
                listItem.appendChild(removeUser);
            }
              
            groupList.appendChild(listItem);
        });
    } catch (error) {
        console.log(error);
        alert('failed to load group members')
    }
});





document.getElementById('logout').addEventListener('click', async () => {
    try {
        localStorage.removeItem('messages');
        localStorage.removeItem('token');
        window.location.href = "../login/login.html";
    } catch (error) {
        console.error(error);
        alert('failed')
    }
});


document.getElementById('createGroupBtn').addEventListener('click', async () => {
    try {
        const token = appState.token;
        const groupName = document.getElementById('createGroup').value;
        const response = await axios.post(`/group/createGroup`, { groupName: groupName }, { headers: { 'authorization': token } });
        alert(response.data.message)
        groupList()
    } catch (error) {
        console(error);
        alert('failed to create group')
    }
});

const groupList = async () => {
    try {
        const token = appState.token;
        const groups = await axios.get(`/group/getGroup`, { headers: { 'authorization': token } });
        const groupListElement = document.getElementById('groupList');
        groupListElement.innerHTML='';
        groups.data.forEach(group => {
            const listItem = document.createElement('li');
            listItem.id = 'groupListLi';
            listItem.textContent = group.groupName;

            const deleteBtn=document.createElement('button');
            deleteBtn.textContent='Delete';
            deleteBtn.addEventListener('click',async()=>{
                try{
                    const response = await axios.delete('/group/deleteGroup', {
                        headers: {
                            'authorization': token
                        },
                        data: {
                            groupId: appState.currentGroupId
                        }
                    });
                    alert(response.data.message)
                    groupList()
                    
                }catch(error){
                    console.log(error.response.data.message);
                    alert(error.response.data.message);
                }
            });
            listItem.appendChild(deleteBtn)

            listItem.addEventListener('click', () => {
                document.getElementById('rightDiv').style.display='block';

                // Remove 'active' class from all list items
                document.querySelectorAll('#groupList li').forEach(item => {
                    item.classList.remove('active');
                });
                // Add 'active' class to the clicked list item
                listItem.classList.add('active');

                document.getElementById('messageHeading').innerHTML = `Message from group ${group.groupName}`;
                
                document.getElementById('loggedUsersList').innerHTML='';
                document.getElementById('addMembersList').innerHTML='';
                document.getElementById('groupMemberslist').innerHTML='';

                appState.currentGroupId = group.id;
                appState.currentGroupName = group.groupName;
                
                //conect to room
                socket.emit('joinGroup', group.id);

                getMessage(group.id);
            });
            groupListElement.appendChild(listItem);
        });

    } catch (error) {
        console.log(error);
    }
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        document.getElementById('adminNmae').innerHTML = `Welcome ${appState.adminName}`;
        groupList();
    } catch (error) {
        console.log(error);
    }
});
