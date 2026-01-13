let users = JSON.parse(localStorage.getItem("users")) || [];

function showSignup(){
  document.getElementById("loginBox").classList.remove("active");
  document.getElementById("signupBox").classList.add("active");
}

function showLogin(){
  document.getElementById("signupBox").classList.remove("active");
  document.getElementById("loginBox").classList.add("active");
}

function signup(){
  let name = fullName.value.trim();
  let user = signupUser.value.trim();
  let pass = signupPass.value;
  let pass2 = signupPass2.value;

  if(!name || !user || !pass || !pass2){
    alert("Fill all fields");
    return;
  }

  if(pass !== pass2){
    alert("Passwords do not match");
    return;
  }

  if(users.find(u => u.username === user)){
    alert("Username already exists");
    return;
  }

  users.push({name, username:user, password:pass});
  localStorage.setItem("users", JSON.stringify(users));

  alert("Account created!");
  showLogin();
}

function login(){
  let user = loginUser.value.trim();
  let pass = loginPass.value;

  let found = users.find(u => u.username === user && u.password === pass);

  if(found){
    localStorage.setItem("loggedUser", user);
    window.location.href = "index.html"; // redirect to GPA calculator
  }else{
    alert("Wrong username or password");
  }
}
