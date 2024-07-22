const form=document.getElementById('signupForm')
form.addEventListener('submit',async(e)=>{
    e.preventDefault();
    try {
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });
        const response = await axios.post(`/user/signup`, data);
        alert(response.data.message)
        window.location.href = "../login/login.html";
    } catch (error) {
        document.body.innerHTML += `<div style="color:red;">${error.response.data.error} <div>`;
            //dynamically adds a new <div> element to the end of the <body>
    }
})