let chatSubBtn = document.getElementById('chat-submit');
let messageContainer = document.getElementById('message-container')

$(document).bind('keypress', function(e){
   if(e.which === 13) { // return
      $('#chat-submit').trigger('click');
   }
});

$(document).ready(function(){
	console.log('JQuery connected')
  //Responsive navbar animation
	$(window).scroll(function(){
    var scroll = $(window).scrollTop();
   if (scroll > 50) {
   $('.navbar').addClass('sticky');
   }
   else{
   	 $('.navbar').removeClass('sticky');
   }
})
    $('.menu-btn').click(function(){
    $('.navbar .menu').toggleClass('active');
    $('.menu-btn i').toggleClass('active');
  })
})
  //scroll top btn animation
  $(window).scroll(function(){
    var scroll = $(window).scrollTop();
   if (scroll > 500) {
   $('.scroll-up-btn').addClass('show');
   }
   else{
     $('.scroll-up-btn').removeClass('show');
   }
})
   $(".scroll-up-btn").click(function() {
        $("html, body").animate({ 
            scrollTop: 0 
        }, "slow");
        return false;
    });
   //typing animation script
   var typed = new Typed(".typing",{
    strings: ["Frontend Dev","Backend Dev","Innovator","Learner"],
    typeSpeed: 100,
    bacSpeed: 60,
    loop: true
   })
var typed = new Typed(".typing-2",{
    strings: ["Frontend Dev","Backend Dev","Innovator","Learner"],
    typeSpeed: 100,
    bacSpeed: 60,
    loop: true
})
$('form').submit(
  async (event) => {
  event.preventDefault();
  try {
      const data = {
        username: $('#nameField').val(),
        email: $('#emailField').val(),
        message: $('#messageField').val(),
      } 

    const response = await axios.post('/send',data);
    console.log(response)
    if (response.data.success == true) {
      $('.alert-success').css("display","block");
    }
    else if (response.data.success == false) {
      $('.alert-error').css("display","block");
    }
  } catch (error) {
    console.error(error);
    console.log(error.response);
  }
});
//alerts
$('.alert .close').click(() => {
  $('.alert').css("display","none");
})

//chat icon

$(document).ready(function(){
    $('#chat-icon').click(function(){
    var hidden = $('#livechat');
    if (hidden.hasClass('visible')){
        hidden.animate({"left":"-1000px"}, "slow").removeClass('visible');
    } else {
        hidden.animate({"left":"0px"}, "slow").addClass('visible');
        setTimeout(() => {
          startChat()
        },3000)
    }
    });
});

$('.close-chat').click(() => {
  $('#livechat').css("left","-1000px");
})

const socket = io('https://saswat-portfolio.herokuapp.com')

function startChat() {
  const name = prompt('What is your name?')
appendMessage('You joined',null,'left')
socket.emit('new-user',name)

socket.on('chat-message',(data) => {
  appendMessage(data.message,data.name,'right')
})

socket.on('user-connected',name => {
  appendMessage(`${name} just joined`,null,'right')
})

socket.on('user-disconnected',name => {
  appendMessage(`${name} just left`,null,'right')
})

chatSubBtn.addEventListener('click',() => {
  let chatInp = document.getElementById('chat-input');
  let chatMessage = chatInp.value;

  socket.emit('send-chat-message',chatMessage);
  appendMessage(chatMessage,'You','left')
  chatInp.value = ''
})
}

function appendMessage(message,name,position) {
  const messageElement = document.createElement('div')
  messageElement.classList.add('messageBox')
  const p  = document.createElement('span');
  if (name !== null) {
    const nameElement = document.createElement('span');
    nameElement.classList.add('senderInfo')
    nameElement.innerText = `${name}: `
    messageElement.append(nameElement)
  }
  if (position == 'left') {
    messageElement.classList.add('variant1')
  }
  else if (position == 'right') {
    messageElement.classList.add('variant2')
  }
  p.innerText = message;
  p.classList.add('chat_message')

  messageElement.append(p)
  messageContainer.append(messageElement)
}