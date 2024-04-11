function createRadialMenu(options) {

    let anchor = document.getElementById(options.anchorId);
    var anchorId = options.anchorId;
    var containerId = anchor.parentNode.id;
    var container = anchor.parentNode;
    //container.style.border = "3px solid red"; /// para testes em dev

    let wheel = document.createElement('div');
    wheel.classList.add('wheel');
    container.appendChild(wheel);

    let subMenu = document.createElement('div');
    subMenu.classList.add('subMenu');
    container.appendChild(subMenu);

    let numButtons = options.items.length;
    let wheelSize = 120;
    let radius = 120; // Raio do círculo
    let iconSize = 20; // Tamanho do ícone
    let buttonWidth = 48; // Largura do botão
    let buttonHeight = 48; // Altura do botão
    let numDegrees = 170; // Número de graus para o posicionamento dos botões
    let initialAngle = 5; // Ângulo inicial ou deslocamento em graus
    let iconRotate = true; // Opção de rotação do ícone
    let smartMode = false;
    let animateAtCreation = false;

    var toleranceX = 10;
    var toleranceY = 30;

    //
    // validate parameters/options
    //
    { // usado para facilitar a visualização, pois permite colapsar o codigo
        try {
            wheelSize = options.wheelSize;
        }
        catch { }
        try {
            radius = options.radius;
        }
        catch { }
        try {
            iconSize = options.iconSize;
        }
        catch { }
        try {
            buttonWidth = options.buttonWidth;
        }
        catch { }
        try {
            buttonHeight = options.buttonHeight;
        }
        catch { }
        try {
            numDegrees = options.degrees;
        }
        catch { }
        try {
            initialAngle = options.initialAngle;
        }
        catch { }
        try {
            iconRotate = options.iconRotate;
        }
        catch { }
        try {
            smartMode = options.smartMode;
        }
        catch { }
        try {
            animateAtCreation = options.animate;
        }
        catch { }
    }

    var needSavePosition = false;

    if (smartMode) {
        //var initialPosition = restoreButtonPosition();
        //anchor.style.left = `${initialPosition.left}px`;
        //anchor.style.top = `${initialPosition.top}px`;
    }

    let addx = (buttonWidth / 2) + 0;
    let addy = buttonWidth / 2;
    let offsetX, offsetY, isDragging = false;
    let touchStartTime = 0;
    let touchTimer;
    let touchMoveThreshold = 5; // Limite de movimento do toque para iniciar o arrasto

    function getQuadrant() {
        var anchor = document.getElementById(options.anchorId);
        var anchorRect = anchor.getBoundingClientRect();
        var anchorX = anchorRect.left + anchorRect.width / 2;
        var anchorY = anchorRect.top + anchorRect.height / 2;
        var windowWidth = container.offsetWidth;
        var windowHeight = container.offsetHeight;
        var result = '';
        // Identifica em que quadrante está o elemento âncora

        if (anchorX <= windowWidth / 2 && anchorY <= windowHeight / 2) {
            result = 'top-left';
        } else if (anchorX > windowWidth / 2 && anchorY <= windowHeight / 2) {
            result = 'top-right';
        } else if (anchorX <= windowWidth / 2 && anchorY > windowHeight / 2) {
            result = 'bottom-left';
        } else {
            result = 'bottom-right';
        }
        return result;
    }

    var quadrant = getQuadrant();
    var quadrantIncrement = -90;






    // 1083.8067626953125 376.90338134765625 160 1172 1192
    // Função para verificar se um ponto está dentro dos limites do retângulo
    function calcularPontosIntersecao(anchorX, anchorY, radius, containerWidth, containerHeight) {

        var circle = { x: anchorX, y: anchorY, r: radius };
        var rect = { x: 0, y: 0, w: containerWidth, h: containerHeight };

        const pontosIntersecao = [];

        // Calcula as coordenadas do centro do retângulo
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;

        // Calcula a distância entre o centro do retângulo e o centro do círculo
        const dx = Math.abs(anchorX - centerX);
        const dy = Math.abs(anchorY - centerY);

        // Calcula o ângulo do vetor entre o centro do retângulo e o centro do círculo
        const theta = Math.atan2(dy, dx);

        // Calcula os ângulos das retas tangentes ao círculo a partir do centro do retângulo
        const alpha = Math.asin(radius / Math.sqrt(dx ** 2 + dy ** 2));
        const beta = Math.PI / 2 - alpha;

        // Calcula os pontos de interseção com as quatro bordas do retângulo
        const intersection1 = {
            x: centerX + Math.cos(theta + beta) * radius,
            y: centerY - Math.sin(theta + beta) * radius
        };
        const intersection2 = {
            x: centerX + Math.cos(theta - beta) * radius,
            y: centerY - Math.sin(theta - beta) * radius
        };
        const intersection3 = {
            x: centerX + Math.cos(Math.PI - theta - beta) * radius,
            y: centerY + Math.sin(Math.PI - theta - beta) * radius
        };
        const intersection4 = {
            x: centerX + Math.cos(Math.PI - theta + beta) * radius,
            y: centerY + Math.sin(Math.PI - theta + beta) * radius
        };

        // Verifica se os pontos de interseção estão dentro dos limites do retângulo do contêiner e adiciona-os à lista
        if (intersection1.x >= 0 && intersection1.y >= 0 && intersection1.x <= containerWidth && intersection1.y <= containerHeight) {
            pontosIntersecao.push(intersection1);
        }
        if (intersection2.x >= 0 && intersection2.y >= 0 && intersection2.x <= containerWidth && intersection2.y <= containerHeight) {
            pontosIntersecao.push(intersection2);
        }
        if (intersection3.x >= 0 && intersection3.y >= 0 && intersection3.x <= containerWidth && intersection3.y <= containerHeight) {
            pontosIntersecao.push(intersection3);
        }
        if (intersection4.x >= 0 && intersection4.y >= 0 && intersection4.x <= containerWidth && intersection4.y <= containerHeight) {
            pontosIntersecao.push(intersection4);
        }

        return pontosIntersecao;
    }

    // return true if the rectangle and circle are colliding
    function RectCircleColliding(circle, rect) {
        var result = boxCircle(rect.x, rect.y, rect.w, rect.h, circle.x, circle.y, circle.r);
        return result;
    }

    /**
     * box-circle collision
     * @param {number} xb top-left corner of box
     * @param {number} yb top-left corner of box
     * @param {number} wb width of box
     * @param {number} hb height of box
     * @param {number} xc center of circle
     * @param {number} yc center of circle
     * @param {number} rc radius of circle
     */
    function boxCircle(xb, yb, wb, hb, xc, yc, rc) {
        var hw = wb / 2
        var hh = hb / 2
        var distX = Math.abs(xc - (xb + wb / 2))
        var distY = Math.abs(yc - (yb + hb / 2))

        if (distX > hw + rc || distY > hh + rc) {
            return false
        }

        if (distX <= hw || distY <= hh) {
            return true
        }

        var x = distX - hw
        var y = distY - hh
        return x * x + y * y <= rc * rc
    }

    function calcularIntersecaoLinhaCirculo(x1, y1, x2, y2, cx, cy, radius) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dr = Math.sqrt(dx * dx + dy * dy);
        const D = x1 * y2 - x2 * y1;
        const discriminant = radius * radius * dr * dr - D * D;

        if (discriminant < 0) {
            return null; // Não há interseção
        }

        const signY = dy < 0 ? -1 : 1;
        const xIntersection1 = (D * dy + signY * dx * Math.sqrt(discriminant)) / (dr * dr);
        const xIntersection2 = (D * dy - signY * dx * Math.sqrt(discriminant)) / (dr * dr);
        const yIntersection1 = (-D * dx + Math.abs(dy) * Math.sqrt(discriminant)) / (dr * dr);
        const yIntersection2 = (-D * dx - Math.abs(dy) * Math.sqrt(discriminant)) / (dr * dr);

        const intersections = [];
        if (isFinite(xIntersection1) && isFinite(yIntersection1)) {
            intersections.push({ x: xIntersection1, y: yIntersection1 });
        }
        if (isFinite(xIntersection2) && isFinite(yIntersection2)) {
            intersections.push({ x: xIntersection2, y: yIntersection2 });
        }

        return intersections.length > 0 ? intersections : null;
    }

    function recalculateParms() {
        if (options.smartMode) {

            var anchor = document.getElementById(options.anchorId);
            var anchorRect = anchor.getBoundingClientRect();
            var anchorX = anchorRect.left + anchorRect.width / 2;
            var anchorY = anchorRect.top + anchorRect.height / 2;

            var windowWidth = container.offsetWidth;
            var windowHeight = container.offsetHeight;

            var windowWidth = container.offsetWidth;
            var result = calcularPontosIntersecao(anchorX, anchorY, radius + buttonHeight, windowWidth, windowHeight);


            // Calcula a distância do centro da âncora em relação às margens
            var distanceToLeft = anchorRect.x;
            var distanceToRight = windowWidth - (anchorRect.x + anchorRect.width);
            var distanceToTop = anchorRect.y;
            var distanceToBottom = windowHeight - (anchorRect.y + anchorRect.height);

            // Identifica em que quadrante está o elemento âncora
          
            quadrant = getQuadrant();

            // Aplica os ângulos com base no quadrante identificado
            numDegrees = 80;
            initialAngle = 5;
            quadrantIncrement = -90;
            var factorSec = 10;

            // testar cada lateral top/bottom/left/right
            var canTop = (distanceToTop > options.radius + buttonHeight + factorSec) ? 1 : 0;
            var canBottom = (distanceToBottom > options.radius + buttonHeight + factorSec) ? 1 : 0;
            var canLeft = (distanceToLeft > options.radius + buttonWidth + factorSec) ? 1 : 0;
            var canRight = (distanceToRight > options.radius + buttonWidth + factorSec) ? 1: 0;

            var totalAngles = canTop + canBottom + canLeft + canRight;

            var numDegreesBase = totalAngles * 90;

            // testar se permite 360...
            if (numDegreesBase == 360) {

                var numItems = options.items.length;
                var dif = 360 / numItems;
                numDegrees = 360-dif;
                initialAngle = dif;
            }
            else { // então testar se cabe  mais ...

                initialAngle = 5;
                numDegrees = numDegreesBase - 10;
            }

            // aqui trata quadrantes e angulos iniciais
            if (numDegreesBase == 270) {
                if (canTop == 0 && canLeft == 1 && canRight == 1) quadrantIncrement = -90 - 45;
                if (canLeft == 0 && canTop == 1 && canBottom == 1) quadrantIncrement = -270 - 45;
                if (canBottom == 0 && canRight == 1 && canTop == 1) quadrantIncrement = -180 - 45;
                if (canRight == 0) quadrantIncrement = -0 - 45;

                if (canBottom == 0 && canLeft == 1 && canRight == 1) quadrantIncrement = -90 - 45;
                if (canRight == 0 && canTop == 1 && canBottom == 1) quadrantIncrement = -270 - 45;
                if (canBottom == 0 && canRight == 1 && canTop == 1) quadrantIncrement = -180 - 45;
                if (canRight == 0) quadrantIncrement = -0 - 45;
            }
            if (numDegreesBase == 180) {
                if (canTop == 1) quadrantIncrement = -90;
                if (canBottom == 1) quadrantIncrement = -270;
                if (canLeft == 1) quadrantIncrement = -180;
                if (canRight == 1) quadrantIncrement = 0; 
            }
            if (numDegreesBase == 90) {
                if (canRight==1) quadrantIncrement = -90;
                if (canLeft ==1) quadrantIncrement = -180;
                if (camBottom == 1 ) quadrantIncrement = 0; 
                if (canTop == 1) quadrantIncrement = -270; 
            }


            // Define os valores calculados para o menu radial
            //console.debug('------------------------------------------------');
            //console.debug('anchorRect            ',anchorRect);
            //console.debug('canTop                ' + canTop);
            //console.debug('canBottom             ' + canBottom);
            //console.debug('canLeft               ' + canLeft);
            //console.debug('canRight              ' + canRight);
            //console.debug('windowWidth           ' + windowWidth);
            //console.debug('windowHeight          ' + windowHeight);
            //console.debug('<<<< distanceToLeft   ' + distanceToLeft);
            //console.debug('>>>> distanceToRight  ' + distanceToRight);
            //console.debug('^^^^ distanceToTop    ' + distanceToTop);
            //console.debug('vvvv distanceToBottom ' + distanceToBottom);
            //console.debug('quadrant              ' + quadrant);
            //console.debug('numDegreesBase        ' + numDegreesBase);
            //console.debug('numDegrees            ' + numDegrees);
            //console.debug('initialAngle          ' + initialAngle);
            //console.debug('quadrantIncrement     ' + quadrantIncrement);
        }
    }





   

    { // usado para facilitar a visualização, pois permite colapsar o codigo
        anchor.addEventListener('contextmenu', e => e.preventDefault() & e.stopPropagation());
        anchor.addEventListener('mousemove', onMouseMove);
        anchor.addEventListener('mousedown', onMouseDownStart);
        anchor.addEventListener('mouseup', onMouseUpStart);
        anchor.addEventListener('mouseleave', onMouseLeave);
        anchor.addEventListener('touchstart', onTouchStart);
        anchor.addEventListener('mousedown', onStartDrag);
        anchor.addEventListener('touchmove', onTouchMove);
    }

    let showing, anchorX, anchorY, min = wheelSize / 2; // 100;

    function getRelativePosition() {

        // Obter as coordenadas left e top do contêiner pai
        var containerLeft = container.getBoundingClientRect().left;
        var containerTop = container.getBoundingClientRect().top;

        // Obter as coordenadas left e top do elemento âncora
        var anchorLeft = anchor.getBoundingClientRect().left;
        var anchorTop = anchor.getBoundingClientRect().top;

        // Calcular as coordenadas left e top do elemento âncora em relação ao contêiner pai
        var anchorLeftRelativeToContainer = anchorLeft - containerLeft;
        var anchorTopRelativeToContainer = anchorTop - containerTop;

        return { x: anchorLeftRelativeToContainer, y: anchorTopRelativeToContainer }

    }

    function convertToContainerCoordinates(x, y) {

        // Calcula as coordenadas do canto superior esquerdo do contêiner
        var containerLeft = container.getBoundingClientRect().left;
        var containerTop = container.getBoundingClientRect().top;

        // Calcular as coordenadas left e top do elemento âncora em relação ao contêiner pai
        var relX = x - containerLeft;
        var relY = y - containerTop;

        return { x: relX, y: relY }

    }

    function convertToAnchorCoordinates(x, y) {
        var container = document.getElementById(containerId);

        // Calcula as coordenadas do canto superior esquerdo do contêiner
        var containerRect = container.getBoundingClientRect();
        var containerX = containerRect.left;
        var containerY = containerRect.top;

        var relX = containerX + x;
        var relY = containerY + y;
        //console.debug('convertToAnchorCoordinates', containerX, containerY,x,y)
        return { x: relX, y: relY };
    }

    function onMouseDownStart(e) {
        touchStartTime = Date.now();
        touchTimer = setTimeout(() => {
            onStartDrag(e);
        }, 800); // Tempo limite para considerar como pressionamento longo (800ms)
    }

    function onMouseUpStart(e) {
        clearTimeout(touchTimer);
        if ((Date.now() - touchStartTime) < 800) {
            onMouseDown(e);
        }
    }

    function onMouseLeave() {
        clearTimeout(touchTimer);
    }

    function onMouseDown({ clientX: x, clientY: y }) {

        if (showing) {
            showing = false;
            wheel.setAttribute('data-chosen', 0);
            wheel.classList.remove('on');
            return;
        };

        wheel.style.width = `${wheelSize}px`;
        wheel.style.height = `${wheelSize}px`;

        wheel.style.minWidth = `${wheelSize}px`;
        wheel.style.h = minHeight = `${wheelSize}px`;

        wheel.style.maxWidth = `${wheelSize}px`;
        wheel.style.maxHeight = `${wheelSize}px`;

        showing = true;
        var anchorRect = anchor.getBoundingClientRect();
        var anchorXRelativeToWindow = anchorRect.left + anchorRect.width / 2;
        var anchorYRelativeToWindow = anchorRect.top + anchorRect.height / 2;

        var wheelWidth = wheel.offsetWidth;
        var wheelHeight = wheel.offsetHeight;
        var offsetX = -1 * (wheelSize / 2);
        var offsetY = 0;
        var wheelX = anchorXRelativeToWindow - wheelWidth / 2 + offsetX;
        var wheelY = anchorYRelativeToWindow - wheelHeight / 2 - offsetY;

        wheel.style.left = `${wheelX}px`;
        wheel.style.top = `${wheelY}px`;

        wheel.classList.add('on');

        mountMenu();
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

        mountMenu();
    }

    function positionSubMenu(container, anchor, subMenu) {
        // Obtém as coordenadas do centro do elemento anchor
        var anchorRect = anchor.getBoundingClientRect();
        var aCenterX = anchorRect.left + anchorRect.width / 2;
        var aCenterY = anchorRect.top + anchorRect.height / 2;
        var aCenter = convertToContainerCoordinates(aCenterX, aCenterY);
        var anchorCenterX = aCenter.x;
        var anchorCenterY = aCenter.y;


        // Calcula as coordenadas do ponto superior esquerdo do container
        var containerRect = container.getBoundingClientRect();
        //var containerLeft = containerRect.left;
        //var containerTop = containerRect.top;
        var containerWidth = containerRect.width;
        var containerHeight = containerRect.height;

        var subMenuRect = subMenu.getBoundingClientRect();
        var subMenuWidth = subMenuRect.width;
        var subMenuHeight = subMenuRect.height;

        //// Calcula as coordenadas relativas do centro do anchor em relação ao container
        //var relativeAnchorCenterX = anchorCenterX - containerLeft;
        //var relativeAnchorCenterY = anchorCenterY - containerTop;

        //// Identifica o quadrante em que o anchor está localizado
        //var quadrant;
        //if (relativeAnchorCenterX <= container.offsetWidth / 2 && relativeAnchorCenterY <= container.offsetHeight / 2) {
        //    quadrant = 'top-left';
        //} else if (relativeAnchorCenterX > container.offsetWidth / 2 && relativeAnchorCenterY <= container.offsetHeight / 2) {
        //    quadrant = 'top-right';
        //} else if (relativeAnchorCenterX <= container.offsetWidth / 2 && relativeAnchorCenterY > container.offsetHeight / 2) {
        //    quadrant = 'bottom-left';
        //} else {
        //    quadrant = 'bottom-right';
        //}

        //var topBottom = quadrant.split('-')[0];
        //var leftRight = quadrant.split('-')[1];

        //// Define o deslocamento horizontal e vertical com base no quadrante
        //var offsetX = 0;
        //var offsetY = 0;
        //switch (leftRight) {
        //    case 'left':
        //        console.debug('é left');
        //        offsetX = -1 * (subMenuWidth + 35);
        //        break;
        //    case 'right':
        //        console.debug('é right');
        //        offsetX = -35;
        //        break;
        //}
       
        //switch (topBottom) {
        //    case 'bottom':
        //        console.debug('é bottom');
        //        offsetY = 35;
        //        break;
        //    case 'top':
        //        console.debug('é top');
        //        offsetY = -1 * (subMenuHeight + 35);
        //        break;
        //}

        offsetX = -1 * (subMenuWidth / 2);
        offsetY = -1 * (subMenuHeight / 2);
        // Calcula as coordenadas do ponto superior esquerdo do subMenu
        var subMenuLeft = anchorCenterX + offsetX ;
        var subMenuTop = anchorCenterY + offsetY;

        if (subMenuLeft < toleranceX) {
            console.debug('compensou left <');
            subMenuLeft = toleranceX;
        }
        if (subMenuLeft + subMenuWidth + toleranceX > containerWidth) {
            console.debug('compensou left >');
            subMenuLeft = containerWidth - subMenuWidth - toleranceX;
        }

        if (subMenuTop < toleranceY) {
            console.debug('compensou top <');
            subMenuTop = toleranceY;
        }
        if (subMenuTop + subMenuHeight + toleranceY > containerHeight) {
            console.debug('compoensou top >');
            subMenuTop = containerHeight - subMenuHeight - toleranceY;
        }

        var coords = convertToAnchorCoordinates(subMenuLeft, subMenuTop);

        // Define as coordenadas de posicionamento do subMenu
        subMenu.style.left = coords.x + 'px';
        subMenu.style.top = coords.y + 'px';
    }

    function mountSubMenu(element) {
        subMenu.classList.remove('on');
        var data;

        try {
            data = element.getAttribute('data-subitems');
        }
        catch { }

        var menu = JSON.parse(data);
        var items = [];
        menu.forEach(function (elem) {
            items.push({
                link: elem.link,
                img: elem.img,
                caption: elem.caption
            });
        });

        var ul = document.createElement('ul');
        ul.style.lineHeight = `${iconSize}px`;

        items.forEach(function (elem) {
            var li = document.createElement('li');
            li.onclick = function () {
                execute(li, elem.link);
            };

            var iconElement;
            if (elem.img.includes(".")) {
                iconElement = document.createElement('img');
                iconElement.src = elem.img;
                iconElement.style.width = `${iconSize * 0.7}px`;
            } else if (elem.img.includes("fa ")) {
                iconElement = document.createElement('i');
                iconElement.className = elem.img;
                iconElement.style.fontSize = `${iconSize * 0.7}px`;
            } else {
                iconElement = document.createElement('span');
                iconElement.className = "material-symbols-outlined";
                iconElement.style.fontSize = `${iconSize * 0.7}px`;
                iconElement.textContent = elem.img;
            }

            iconElement.style.color = "white";
            iconElement.style.lineHeight = `${iconSize}px`;
            li.appendChild(iconElement);

            var captionSpan = document.createElement('span');
            captionSpan.style.fontSize = `${iconSize * 0.7}px`;
            captionSpan.style.color = "white";
            captionSpan.style.lineHeight = `${iconSize}px`;
            captionSpan.textContent = ` ${elem.caption}`;
            li.appendChild(captionSpan);

            ul.appendChild(li);
        });

        subMenu.innerHTML = '';

        var btnControl = document.createElement('div');
        btnControl.classList.add('subMenuBtn');
        btnControl.onclick = function () {
            subMenu.classList.remove('on');
            subMenu.innerHTML = '';
        };
        var iBtn = document.createElement('i');
        iBtn.className = "fa fa-close";
        iBtn.style.fontSize = `18px`;
        btnControl.appendChild(iBtn);

        subMenu.appendChild(btnControl);
        subMenu.appendChild(ul);
        positionSubMenu(container, anchor, subMenu); 
        subMenu.classList.add('on');
        positionSubMenu(container, anchor, subMenu); // tem que estar na tela para posicionar
    }

    function execute(element, action) {

        var baseAction = action;
        var actionToPerform = action.toLowerCase();
        if (action.includes('/')) {
            actionToPerform = 'href';
        }
        switch (actionToPerform) {
            case '':
            case 'javascript:':
            case 'javascript:;':
            case 'javascript':
            case 'menu':
                mountSubMenu(element);     
                break;
            case 'href':
                window.location.href = baseAction;
                break;
        }
      }

    function mountMenu() {

        var animate = false;
        if (wheel.innerHTML.length < 10) {
            animate = true;
        }

        subMenu.classList.remove('on');
        wheel.innerHTML = "";
       
        try {
            recalculateParms();
        }
        catch {
            console.debg('erro na montagem');
        }
        //
        // cira os elementos e opcionalmente rotaciona icones
        //
        {
            for (let i = 0; i < numButtons; i++) {
                const button = document.createElement('div');
                button.classList.add('arc');
                button.title = options.items[i].caption != null ? options.items[i].caption : '';
                button.style.width = `${buttonWidth}px`;
                button.style.height = `${buttonHeight}px`;
                button.dataset.offsetX = '0';
                button.dataset.offsetY = '0';

                button.onclick = function () {
                    // Chama a função de evento clicado com os parâmetros desejados
                    execute(button, options.items[i].link);
                }; 

                let angleIncrement = (Math.PI * numDegrees / 180) / (numButtons - 1);
                let angle = angleIncrement * i - Math.PI / 2 + (initialAngle * Math.PI / 180);

                // neste ponto incluir o acrescimo de reposção
                var radianos = quadrantIncrement * Math.PI / 180;
                angle = angle + radianos;

                angle += ((-90 * Math.PI) / 180); // apenas para reorienta em 90 graus mesmo... não afeta a posição do botão

                let rotateStyle = '';
                if (iconRotate) {
                    var rotAngle = angle * (180 / Math.PI);
                    rotAngle = rotAngle;
                    rotateStyle = `transform: rotate(${rotAngle}deg);`;
                }

                var icon = options.items[i].img;
                if (icon.includes(".")) {
                    button.innerHTML = `<img src="${icon}" style="width:${iconSize}px; color:white; ${rotateStyle}" />`;
                }
                else {
                    if (icon.includes("fa ")) {
                        button.innerHTML = `<i class="${icon}" style="font-size:${iconSize}px; color:white; ${rotateStyle}"></i>`;
                    }
                    else {
                        button.innerHTML = `<span class="material-symbols-outlined" translate="no" style="font-size:${iconSize}px; color:white; ${rotateStyle}">${icon}</span>`;
                    }
                }

                //
                // para subitens...
                //
                button.setAttribute('data-subitems', '');
                try {
                    if (options.items[i].subitems != null &&
                        options.items[i].subitems.length > 0) {
                        var subItemsStr = JSON.stringify(options.items[i].subitems);
                        button.setAttribute('data-subitems', subItemsStr);
                    }
                }
                catch (err) {
                    console.deq(err);
                }

                wheel.appendChild(button);
            }
        }

        //
        // posiciona elementos radialmente
        //
        {
            const arcs = document.querySelectorAll('.arc');
            const angleIncrement = (Math.PI * numDegrees / 180) / (numButtons - 1);
            const centerX = wheel.offsetWidth / 2;
            const centerY = wheel.offsetHeight / 2;

            arcs.forEach((arc, i) => {

                var angle = angleIncrement * i - Math.PI / 2 + (initialAngle * Math.PI / 180);

                // neste ponto incluir a reposição
                var radianos = quadrantIncrement * Math.PI / 180;
                angle = angle + radianos;

                const posX = centerX - radius * Math.cos(angle) + addx;
                const posY = centerY - radius * Math.sin(angle) + addy;



                //
                // animação
                //
                if (animate && animateAtCreation) {
                    arc.style.left = `${centerX}px`;
                    arc.style.top = `${centerY}px`;
                    arc.style.transition = `left ${i + 2}00ms, top ${i + 2}00ms`;
                }
                //
                // fim da animação
                //


                arc.style.left = `${posX - arc.offsetWidth / 2}px`;
                arc.style.top = `${posY - arc.offsetHeight / 2}px`;

                arc.dataset.angle = angle;
            });
        }

    }

    function onStartDrag(e) {
        if (showing) return;
        const rect = anchor.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        anchorX = e.clientX;
        anchorY = e.clientY;
        anchor.style.cursor = 'grabbing';
        wheel.innerHTML = "";
        isDragging = true;
        anchor.classList.add('floating-label-focus');
        document.addEventListener('mousemove', dragAnchor);
        document.addEventListener('mouseup', stopDragging);
    };

    function onTouchStart(e) {
        touchStartTime = Date.now();
        const touch = e.touches[0];
        anchorX = touch.clientX;
        anchorY = touch.clientY;
        touchTimer = setTimeout(() => {
            onStartDragTouch(touch);
        }, 800); // Tempo limite para considerar como pressionamento longo (800ms)
    }

    function onStartDragTouch(e) {
        if (showing) return;
        var rect = anchor.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        //anchorX = e.clientX;
        //anchorY = e.clientY;
        anchor.style.cursor = 'grabbing';
        wheel.innerHTML = "";
        isDragging = true;
        anchor.classList.add('floating-label-focus');
        document.addEventListener('touchmove', dragAnchorTouch);
        document.addEventListener('touchend', stopDragging);
    }

    function onTouchMove(e) {
        if (!showing) return;

        var touch = e.touches[0];
        let dx = touch.clientX - anchorX;
        let dy = touch.clientY - anchorY;
        let mag = Math.sqrt(dx * dx + dy * dy);
        if (mag >= touchMoveThreshold) {
            clearTimeout(touchTimer);
        }
    }

    function dragAnchor(e) {
        if (isDragging) {
            var x = e.clientX - offsetX;
            var y = e.clientY - offsetY;

            var xLimit = container.offsetWidth - anchor.offsetWidth - toleranceX;
            var yLimit = container.offsetHeight - anchor.offsetHeight ;

            rel = convertToContainerCoordinates(x, y);
            if (rel.x < toleranceX) { x = convertToAnchorCoordinates(toleranceX, toleranceY).x; }
            if (rel.x > xLimit) { x = convertToAnchorCoordinates(xLimit, yLimit).x; }

            if (rel.y < toleranceY) { y = convertToAnchorCoordinates(toleranceX, toleranceY).y; }
            if (rel.y > yLimit) { y = convertToAnchorCoordinates(xLimit, yLimit).y; }

            anchor.style.left = `${x}px`;
            anchor.style.top = `${y}px`;
            needSavePosition = true;
        }
    }

    function dragAnchorTouch(e) {
        if (isDragging) {
            var touch = e.touches[0];

            var x = touch.clientX - offsetX;
            var y = touch.clientY - offsetY;

            var xLimit = container.offsetWidth - anchor.offsetWidth - toleranceX;
            var yLimit = container.offsetHeight - anchor.offsetHeight;
            try {
                rel = convertToContainerCoordinates(x, y);
                if (rel.x < toleranceX) { x = convertToAnchorCoordinates(toleranceX, toleranceY).x; }
                if (rel.x > xLimit) { x = convertToAnchorCoordinates(xLimit, yLimit).x; }

                if (rel.y < toleranceY) { y = convertToAnchorCoordinates(toleranceX, toleranceY).y; }
                if (rel.y > yLimit) { y = convertToAnchorCoordinates(xLimit, yLimit).y; }
            }
            catch { }

            anchor.style.left = `${x}px`;
            anchor.style.top = `${y}px`;
            needSavePosition = true;
        }
    }

    function stopDragging() {

        isDragging = false;
        anchor.style.cursor = 'grab';
        anchor.classList.remove('floating-label-focus');
        document.removeEventListener('mousemove', dragAnchor);
        document.removeEventListener('mouseup', stopDragging);
        document.removeEventListener('touchmove', dragAnchorTouch);
        document.removeEventListener('touchend', stopDragging);
      
    }

    // apenas para testes de posionamento em dev
    { 
        function atualizarCoordenadas() {
            var anchor = document.getElementById('anchor');

            var coordenadaX = anchor.getBoundingClientRect().left;
            var coordenadaY = anchor.getBoundingClientRect().top;

            var position = getRelativePosition();

            var aPosition = convertToAnchorCoordinates(position.x, position.y);
            position = convertToContainerCoordinates(coordenadaX, coordenadaY);

            anchorMonitor.textContent = `${coordenadaX}\n${coordenadaY}\n----${position.x}\n${position.y}\n----\n${aPosition.x}\n${aPosition.y}`;
        }

        // setInterval(atualizarCoordenadas, 500);
    }

    //
    // paara tornar visibel em situações de redim.
    //
    function turnVisible() {
        var anchor = document.getElementById('anchor');

        var x = anchor.getBoundingClientRect().left;
        var y = anchor.getBoundingClientRect().top;

        var xLimit = container.offsetWidth - anchor.offsetWidth - toleranceX;
        var yLimit = container.offsetHeight - anchor.offsetHeight;

        rel = convertToContainerCoordinates(x, y);
        var needRepos = false;
        if (rel.x < toleranceX) {
            needRepos = true;
            x = convertToAnchorCoordinates(toleranceX, toleranceY).x;
        }
        if (rel.x > xLimit) {
            needRepos = true;
            x = convertToAnchorCoordinates(xLimit, yLimit).x;
        }

        if (rel.y < toleranceY) {
            needRepos = true;
            y = convertToAnchorCoordinates(toleranceX, toleranceY).y;
        }
        if (rel.y > yLimit) {
            needRepos = true;
            y = convertToAnchorCoordinates(xLimit, yLimit).y;
        }

        if (needRepos) {          
            anchor.style.left = `${x}px`;
            anchor.style.top = `${y}px`;
        }

    }
    setInterval(turnVisible, 3000);

    // Salvar a posição do botão
    function saveButtonPosition() {
        if (needSavePosition && smartMode) {
            needSavePosition = false;
            try {
                var left = anchor.offsetLeft;
                var top = anchor.offsetTop;
                var posicao = { left: left, top: top };

                var posicaoJSON = JSON.stringify(posicao);
                localStorage.setItem('DynButtonPosition', posicaoJSON);
                posicaoJSON = localStorage.getItem('DynButtonPosition');
            }
            catch (err) {
                console.debug(err);
            }
        }
    }
    setInterval(saveButtonPosition, 6000);

    // Recuperar a posição do botão
    function restoreButtonPosition() {
		// não esta funcionando...
		
        try {
            var posicaoJSON = localStorage.getItem('DynButtonPosition');
            if (posicaoJSON) {
                var posicao = JSON.parse(posicaoJSON);
                return posicao;
            } else {
                return getBottomPos();
            }
        }
        catch (err) {
            console.debug(err);
        }
    }

    function getBottomPos() {

        var wa = $('#' + anchorId).width();
        var ha = $('#' + anchorId).height();
        var wc = $('#' + containerId).width();
        var hc = $('#' + containerId).height();

        var x = wc / 2;
        var y = hc - ha - toleranceY ;
        var pos = convertToAnchorCoordinates(x, y);

        var res = {
            left: pos.x,
            top: pos.y
        }
        return res;
    }

};
