document.addEventListener('DOMContentLoaded', function() {
  const anchor = document.getElementById('anchor');
  const wheel = document.getElementById('wheel');
  const numButtons = 7;
  let wheelSize = 120;
  let radius = 120; // Raio do círculo
  let iconSize = 20; // Tamanho do ícone
  let buttonWidth = 48; // Largura do botão
  let buttonHeight = 48; // Altura do botão
  let addx = (buttonWidth / 2) + 0;
  let addy = buttonWidth / 2;
  let numDegrees = 170; // Número de graus para o posicionamento dos botões
  let initialAngle = 5; // Ângulo inicial ou deslocamento em graus
  let iconRotate = true; // Opção de rotação do ícone
  let iconAngle = 0; // Ângulo do ícone
  
  anchor.addEventListener('contextmenu', e => e.preventDefault() & e.stopPropagation());
  anchor.addEventListener('mousedown', onMouseDown);
  anchor.addEventListener('touchstart', e => onMouseDown(e.touches[0]));
  anchor.addEventListener('mouseup', onMouseUp);
  anchor.addEventListener('touchend', e => onMouseUp(e.touches[0]));
  anchor.addEventListener('mousemove', onMouseMove);
  anchor.addEventListener('touchmove', e => onMouseMove(e.touches[0]));

  let showing, anchorX, anchorY, min =  wheelSize/2; // 100;

  function onMouseDown({ clientX: x, clientY: y }) {
	  
	if (showing) return;
	  
    wheel.style.width =  `${wheelSize}px`;
    wheel.style.height =  `${wheelSize}px`;
	
	wheel.style.minWidth =  `${wheelSize}px`;
    wheel.style.h=minHeight =  `${wheelSize}px`;
	
	wheel.style.maxWidth =  `${wheelSize}px`;
    wheel.style.maxHeight =  `${wheelSize}px`;
	  
    showing = true;
    const anchorRect = anchor.getBoundingClientRect();
    const anchorXRelativeToWindow = anchorRect.left + anchorRect.width / 2;
    const anchorYRelativeToWindow = anchorRect.top + anchorRect.height / 2;

    // Ajusta a posição X e Y do wheel para centralizá-lo sobre o elemento de âncora
	console.debug(wheel.offsetWidth);
    const wheelWidth = wheel.offsetWidth;
    const wheelHeight = wheel.offsetHeight;
    const offsetX = -1*(wheelSize/2); // Ajuste opcional de offset em relação ao elemento de âncora
    const offsetY = 0; // Ajuste opcional de offset em relação ao elemento de âncora
    const wheelX = anchorXRelativeToWindow - wheelWidth / 2 + offsetX; // Ajusta a posição X do wheel
    const wheelY = anchorYRelativeToWindow - wheelHeight / 2 - offsetY; // Ajusta a posição Y do wheel

    wheel.style.left = `${wheelX}px`;
    wheel.style.top = `${wheelY}px`;

    wheel.classList.add('on');

    // Posiciona os botões radialmente ao redor do elemento wheel
    positionRadialButtons();
  }

  function onMouseUp() {
	  
	if (!showing) return;
	
    showing = false;
    wheel.setAttribute('data-chosen', 0);
    wheel.classList.remove('on');
  }

  function onMouseMove({ clientX: x, clientY: y }) {
    if (!showing) return;

    let dx = x - anchorX;
    let dy = y - anchorY;
    let mag = Math.sqrt(dx * dx + dy * dy);
    let index = 0;

    if (mag >= min) {
      let deg = Math.atan2(dy, dx) + 0.625 * Math.PI;
      while (deg < 0) deg += Math.PI * 2;
      index = Math.floor(deg / (Math.PI * 2 / numButtons)) + 1;
    }

    wheel.setAttribute('data-chosen', index);

    positionRadialButtons();
  }

// Gera os botões dinamicamente
for (let i = 0; i < numButtons; i++) {
  const button = document.createElement('div');
  button.classList.add('arc');
  button.style.width = `${buttonWidth}px`; // Define a largura do botão
  button.style.height = `${buttonHeight}px`; // Define a altura do botão
  button.dataset.offsetX = '0'; // Define o deslocamento X padrão
  button.dataset.offsetY = '0'; // Define o deslocamento Y padrão
  
  // Calcula o ângulo do ícone com ou sem rotação, considerando as compensações
  let angleIncrement = (Math.PI * numDegrees / 180) / (numButtons - 1); // Ângulo total de numDegrees
  let angle = angleIncrement * i - Math.PI / 2 + (initialAngle * Math.PI / 180);
  angle += (-90 * Math.PI / 180); // Adicionando -90 graus no sentido anti-horário
  
  let rotateStyle = '';
  if (iconRotate) {
    rotateStyle = `transform: rotate(${angle * (180 / Math.PI)}deg);`; // Convertendo o ângulo de radianos para graus
  }
  
  button.innerHTML = `<i class="fas fa-home" style="font-size:${iconSize}px; color:white; ${rotateStyle}"></i>`; // Adicione o ícone ou conteúdo desejado
  wheel.appendChild(button);
}


  // Função para posicionar os botões radialmente ao redor do elemento wheel
  function positionRadialButtons() {
    const arcs = document.querySelectorAll('.arc');
    const angleIncrement = (Math.PI * numDegrees / 180) / (numButtons - 1); // Ângulo total de numDegrees
    const centerX = wheel.offsetWidth / 2; // Calcula o centro X do elemento wheel
    const centerY = wheel.offsetHeight / 2; // Calcula o centro Y do elemento wheel

    arcs.forEach((arc, i) => {
      // Calcula o ângulo para o botão atual
      const angle = angleIncrement * i - Math.PI / 2 + (initialAngle * Math.PI / 180); // Converte o ângulo inicial de graus para radianos
      // Calcula a posição X e Y do botão
      const posX = centerX - radius * Math.cos(angle) + addx;
      const posY = centerY - radius * Math.sin(angle) + addy;
      // Define a posição do botão e aplica o deslocamento
      arc.style.left = `${posX - arc.offsetWidth / 2}px`;
      arc.style.top = `${posY - arc.offsetHeight / 2}px`;
    });
  }
  
});
