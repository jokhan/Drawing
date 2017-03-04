
// 这个方法用来储存每个圆圈对象
    function Circle(x, y, radius, color) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = color;
      this.isSelected = false;
    }

    // 矩形构造器
    function Rect( x, y, width, height, color, kind) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.color = color;
      this.isSelected = false;
      this.kind = kind;   // 判断是直线还是圆形什么的
      //this.src = "D:\\jokhan\\78307.jpg"    // 自带纹理的图片位置
      this.src = "tiles/default1.jpg"    // 自带纹理的图片位置
      // 0 - 外框
      // 1 - line
      // 2 - circle
      // 3 - rectrangle
      // 4 - 自带图片，固有花纹
    }

    function RectCopy( rect ) {  // rect copy
      this.x = rect.x;
      this.y = rect.y;
      this.width = rect.width;
      this.height = rect.height;
      this.color = rect.color;
      this.isSelected = rect.isSelected;
      this.kind = rect.kind;   // 判断是直线还是圆形什么的
      this.src = rect.src;
    }

    //单点构造器
    function BgPoint( x, y) {
      this.x = x;
      this.y = y;
    }

    //背景图形中的多边形要依靠圆实现
    function BgCircle(x,y,radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
    }

    // 保存画布上所有的圆圈
    var circles = [];
    var rects = []; // 保存画布上所有的矩形
    var points = []; // 保存改变大小时，外接框的八个点

    // canvas画布的位置
    var offsetX = document.getElementById("tools_left").offsetWidth;
    var offsetY = 29;
    var canvasWidth= [600,800];

    var clickPoint = new BgPoint(0,0); //记录拖拽前点击的点    
    var isDrawing = false;  // 在绘画还是在拖动
    var canvas;
    var context;
    var previousSelectedCircle;
    var previousSltPointIndex;
    var isDragging = false;  // 是否在拖拽
    var isClicked = false;  // 是否在点击状态，用于绘画
    var isScale = false;    // 是否在调整大小
    var tmpRect = new Rect( 0, 0, 500, 500, "black", 1);

    var dev = 0.0001;  //判断浮点数相等的门槛

    window.onload = function() {
      canvas = document.getElementById("canvas");
      context = canvas.getContext("2d");
      //drawRect( tmpRect );
      //canvas.width = canvasWidth[getPar("size")];
      //canvas.height = canvas.width;
      //alert( window.name + "\n"+ getPar("size") + "\n"+ getPar("material") + "\n"+ getPar("grain") );
 
      canvas.onmousedown = canvasClick;
      canvas.onmouseup = stopWorking;
      canvas.onmouseout = stopWorking;
      canvas.onmousemove = dragCircle;

      document.onkeydown = keyDeal;

      //var numSum = getPar("grainNum");
      num1 = 50;
      num2 = 100;
      num3 = 150;
      //num1 = Math.floor(numSum * getPar("smallNum") / 100);
      //num2 = Math.floor(numSum * getPar("middleNum") / 100);
      //num3 = Math.floor(numSum * getPar("largeNum") / 100);
      //drawBackground();
    };

    function getURLParameter(name) {
      return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }
    function getPar(name) {
       var reg = new RegExp("[?|&]" + name + "=([^&]*)(&|$)");
       var r = reg.exec( window.name );
       //console.log( r );
       if (r != null) return r[1]; return "";
    }

    function keyDeal(e) {
      var keycode = 0;
      keycode = e.which;
      if( keycode == 8 || keycode == 46) {
        // backspace or delete
        //console.log( "delete now" );
        actDel();
      }
      //console.log( keycode );
    }

    function stopWorking() {
      stopDragging();
      stopDraggingBg();
      if( isClicked ) {
        stopClick();
        var newRect = new RectCopy( tmpRect );
        rects.push( newRect );
        newRect = null;
      }
      if( isScale ) {
        stopScale();
      }
    }

    function startScale() {
      isScale = true;
    }
    function stopScale() {
      isScale = false;
    }

    function startClick() {
      isClicked = true;
    }
    function stopClick() {
      isClicked = false;
    }

    function stopDrawing() {
      isDrawing = false;
      stopClick();
      stopScale();
    }

    function startDrawing() {
      if( previousSelectedCircle != null ) {
        previousSelectedCircle.isSelected = false;
      }
      isDrawing = true;
    }

    function actLine() {
      startDrawing();
      tmpRect.kind = 1;  // 直线为1
      //clickColor( "jokhanLine" );
  //    alert("click line: " + tmpRect.kind );
    }
    function actCircle() {
      startDrawing();
      tmpRect.kind = 2;  // 圆或椭圆为2
      //clickColor( "jokhanCircle" );

    }
    function actRectangle() {
      startDrawing();
      tmpRect.kind = 3;  // 矩形为3
    }
    function actTiles() {
      startDrawing();
      tmpRect.kind = 4;  // 自带可选纹理为4
      tmpRect.src = "tiles/default1.jpg";
    }
    function actDel() {
      if( previousSelectedCircle != null ) {
        if( previousSelectedCircle.isSelected ) {
          rects.splice( rects.length-1, 1 );
          previousSelectedCircle = null;
          drawRects();
        }
      }
    }
    function actGetColor( color ) {
      var newColor = color.toHexString();
      //console.log( newColor );
      if( newColor != tmpRect.color ) {
        tmpRect.color = newColor;
        //tmpRect.kind = 2;
      }
      if( previousSelectedCircle != null ) {
        if( previousSelectedCircle.color != newColor && previousSelectedCircle.isSelected  ) {
          previousSelectedCircle.color = newColor;
          //console.log("change color: actGetColor");
          //rects[rects.length-1].color = newColor;
          drawRects();
        }
      }
    }
    function actLoadImage ( imgSrc ) {
      startDrawing();
      tmpRect.kind = 4;  // 自带可选纹理为4
      tmpRect.src = imgSrc;
    }

    function clearCanvas() {
      // 去除所有圆圈
      circles = [];
      rects = [];
      points = [];
 
      // 重新绘制画布.
      //drawCircles();
      drawRects();
    }

    function drawLine( rect ) {
      var x2 = rect.x + rect.width;
      var y2 = rect.y + rect.height;
      context.beginPath();
      context.moveTo(rect.x, rect.y);
      context.lineTo( x2, y2);
      context.closePath();
      context.lineWidth = 10;
      context.strokeStyle = rect.color;
      //context.strokeStyle = rect.color;
      context.stroke();
     // alert( x2 + "," + y2 );
    }

    function drawCircle( rect ) {
      var a = rect.width / 2;
      var b = rect.height / 2;
      var x = rect.x + a;
      var y = rect.y + b;

      var k = .5522848,
     ox = a * k, // 水平控制点偏移量
     oy = b * k; // 垂直控制点偏移量

     context.beginPath();
      context.lineWidth = 10;
     //从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
     context.moveTo(x - a, y);
     context.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
     context.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
     context.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
     context.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
     context.closePath();
     context.strokeStyle = rect.color;
     context.stroke();

    }

    function drawRectangle( rect ) {
      context.strokeStyle = rect.color;
      context.lineWidth = 10;
      context.strokeRect( rect.x, rect.y, rect.width, rect.height );
    }

    function drawContours( rect ) {
      // 画出外轮廓，选中时画出
      var deltaX = getDeltaX( rect );
      var deltaY = getDeltaY( rect );
      context.strokeStyle = "yellow";
      var tmpX = rect.x - 2 * deltaX;
      var tmpY = rect.y - 2 * deltaY;
      var tmpW = rect.width + deltaX;
      var tmpH = rect.height + deltaY;
      context.strokeRect( tmpX, tmpY, tmpW, tmpH );
      // 8个点用矩形画出来
      points = [];
      var pointWidth = 10;
      var halfWidth = pointWidth / 2;
      var pointColor = "blue";
      var pointTopLeft = new Rect( tmpX - halfWidth, tmpY - halfWidth, pointWidth, pointWidth, pointColor, 3 );
      points.push( pointTopLeft );
      var pointTop = new RectCopy( pointTopLeft );
      pointTop.x += tmpW / 2;
      points.push( pointTop );
      var pointTopRight = new RectCopy( pointTopLeft );
      pointTopRight.x += tmpW;
      points.push( pointTopRight );
      var pointMidLeft = new RectCopy( pointTopLeft );
      pointMidLeft.y += tmpH / 2;
      points.push( pointMidLeft );
      var pointMidRight = new RectCopy( pointMidLeft );
      pointMidRight.x += tmpW;
      points.push( pointMidRight );
      var pointBotLeft = new RectCopy( pointTopLeft );
      pointBotLeft.y += tmpH;
      points.push( pointBotLeft );
      var pointBot = new RectCopy( pointBotLeft );
      pointBot.x += tmpW / 2;
      points.push( pointBot );
      var pointBotRight = new RectCopy( pointBotLeft );
      pointBotRight.x += tmpW;
      points.push( pointBotRight );
      for( var i = 0; i < points.length; i ++ ) {
        drawRect( points[i] );
      }
    }
    function getDeltaX( rect ) {
      // 计算需要向外偏离的距离
      //var result = rect.width < 0 ? -1 : 1;
      var result = getDelta( rect.width );
      return result;
    }
    function getDeltaY( rect ) {
      // 计算需要向外偏离的距离
      //var result = rect.height < 0 ? -1 : 1;
      var result = getDelta( rect.height );
      return result;
    }
    function getDelta( num ) {
      return num < 0 ? -1 : 1; 
    }

    function drawTile( rect ) {
      var img = new Image();
      //img.crossOrigin = "Anonymous";
      img.onload = function() {
        //img.setAttribute('crossOrigin', 'anonymous');
        //context.drawImage( img, rect.x, rect.y, rect.width, rect.height );
        //console.log( canvas.toDataURL() );
      //ctx.drawImage( img, 0, 0 );
      //img.src = rect.src;
      //context.drawImage( img, rect.x, rect.y, rect.width, rect.height );
      }
      img.src = rect.src;
      context.drawImage( img, rect.x, rect.y, rect.width, rect.height );
      //img.crossOrigin = "*";
      //img.setAttribute('crossOrigin', 'anonymous');
    }

    function drawRect( rect ) {
      switch( rect.kind ) {
        case 0: drawContours( rect );
        break;
        case 1: drawLine( rect );
        break;
        case 2: drawCircle( rect );
        break;
        case 3: drawRectangle( rect );
        break;
        case 4: drawTile( rect ); // 画出自选图样
        break;
      }
    }

    function drawRects() {
      // 画出所有的图形
      // 清除画布，准备绘制
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.width;  // 重置画布，若有平移等操作不可用

      if(addBackGround) {
        drawBackground();
      }

      //alert( rects.length );
      //console.log( rects.length );
      for( var i = 0; i < rects.length; i ++) {
        var rect = rects[i];
        //console.log( i + ":" + rect.color );
        drawRect( rect );
        if( rect.isSelected ) {
          var tmpContour = new RectCopy( rect );
          tmpContour.kind = 0;
          drawRect( tmpContour );
        }
      }
    }
    
    function inRect( clickX, clickY, rect) {
      var deltaX = ( clickX - rect.x );
      var deltaY = ( clickY - rect.y );
      return deltaX * ( deltaX - rect.width ) <= 0 && deltaY * ( deltaY - rect.height) <= 0;

    }

    var isDraggingBg = false;
    var previousSltBg = null;
    
    function canvasClick(e) {
      // 取得画布上被单击的点
      var tmp = document.getElementById("tools_left");
      var clickX = e.pageX - canvas.offsetLeft - offsetX;
      var clickY = e.pageY - canvas.offsetTop - offsetY;
      //alert( canvas.offsetLeft + "," + canvas.offsetTop );
 
      if( !isDrawing ) {
        // 先判断是否是要缩放，这个优先级高
        for( var i = 0; i < points.length; i ++ ) {
          var point = points[i];
          if( inRect( clickX, clickY, point ) ) {
            previousSltPointIndex = i;
            startScale();
            return;
          }
        }
        // 查找被点击的矩形
        for( var i = rects.length-1; i >= 0; i --) {
          var rect = rects[i];
          //var deltaX = ( clickX - rect.x );
          //var deltaY = ( clickY - rect.y );
          // 判断这个点是否在矩形内
          //if( deltaX * ( deltaX - rect.width ) <= 0 && deltaY * ( deltaY - rect.height) <= 0 ) {
          if( inRect( clickX, clickY, rect) ) {
            // 清除之前选择的矩形
            if (previousSelectedCircle != null) previousSelectedCircle.isSelected = false;
            // 选中的矩形放在数组尾部，增加优先级
            // 让选中的矩形永远在最上层
            if( i < rects.length-1) {
              // 不是尾部那个矩形，交换
              rects[i] = rects[rects.length-1];
              rects[rects.length-1] = rect;
            }
            previousSelectedCircle = rects[rects.length-1];
            //选择新矩形
            previousSelectedCircle.isSelected = true;
   
            // 使矩形允许拖拽
            isDragging = true;
            clickPoint = new BgPoint(clickX, clickY);
            //console.log("click:(" + clickPoint.x + "," + clickPoint.y + ")");

            //更新显示
            drawRects();

            //停止搜索
            return;
          }
        }

        // 如果没找到，清除之前选择的矩形，
        //再判断是否在移动背景点
        if (previousSelectedCircle != null) 
          previousSelectedCircle.isSelected = false;
        var tmpPoint = new BgPoint(clickX, clickY);
        for(var i = 0; i < backgrd.length; i ++) {
          if(isInside(backgrd[i], tmpPoint) == 1) {
            //previousSltBg = backgrd[i];
            previousSltBg = i;
            //console.log("isSelected:" + previousSltBg);
            isDraggingBg = true;
            clickPoint = new BgPoint(clickX, clickY);
            //更新显示
            drawRects();
            //停止搜索
            return;
          }
        }
        //更新显示
        drawRects();
        /*
        // 查找被单击的圆圈
        for(var i=circles.length-1; i>=0; i--) {
          var circle = circles[i];
          //使用勾股定理计算这个点与圆心之间的距离
          var distanceFromCenter = Math.sqrt(Math.pow(circle.x - clickX, 2)
              + Math.pow(circle.y - clickY, 2))
          // 判断这个点是否在圆圈中
          if (distanceFromCenter <= circle.radius) {
            // 清除之前选择的圆圈
            if (previousSelectedCircle != null) previousSelectedCircle.isSelected = false;
            previousSelectedCircle = circle;
             
            //选择新圆圈
            circle.isSelected = true;
   
            // 使圆圈允许拖拽
            isDragging = true;
   
            //更新显示
            drawCircles();
   
            //停止搜索
            return;
          }
        }
        */
      } else {
        // 正在绘画
        startClick();
        tmpRect.x = clickX;
        tmpRect.y = clickY;
      }
      
    }
 
    //在某个范围内生成随机数
    function randomFromTo(from, to) {
      return Math.floor(Math.random() * (to - from + 1) + from);
    }
 
    
 
    function stopDragging() {
      isDragging = false;
    }

    function startDraggingBg() {
      isDraggingBg = true;
    }
    function stopDraggingBg() {
      isDraggingBg = false;
    }

    function changeScale( clickX, clickY ) {
      switch( previousSltPointIndex ) {
        case 0 : {
          previousSelectedCircle.width -= clickX - previousSelectedCircle.x;
          previousSelectedCircle.height -= clickY - previousSelectedCircle.y;
          previousSelectedCircle.x = clickX;
          previousSelectedCircle.y = clickY;
          break;
        }
        case 1 : {
          previousSelectedCircle.height -= clickY - previousSelectedCircle.y;
          previousSelectedCircle.y = clickY;
          break;
        }
        case 2 : {
          previousSelectedCircle.width = clickX - previousSelectedCircle.x;
          previousSelectedCircle.height -= clickY - previousSelectedCircle.y;
          previousSelectedCircle.y = clickY;
          break;
        }
        case 3 : {
          previousSelectedCircle.width -= clickX - previousSelectedCircle.x;
          previousSelectedCircle.x = clickX;
          break;
        }
        case 4 : {
          previousSelectedCircle.width = clickX - previousSelectedCircle.x;
          break;
        }
        case 5 : {
          previousSelectedCircle.width -= clickX - previousSelectedCircle.x;
          previousSelectedCircle.height = clickY - previousSelectedCircle.y;
          previousSelectedCircle.x = clickX;
          break;
        }
        case 6 : {
          previousSelectedCircle.height = clickY - previousSelectedCircle.y;
          break;
        }
        case 7 : {
          previousSelectedCircle.width = clickX - previousSelectedCircle.x;
          previousSelectedCircle.height = clickY - previousSelectedCircle.y;
          break;
        }
      }
    }
 
    function dragCircle(e) {

      // 取得鼠标位置
      var x = e.pageX - canvas.offsetLeft - offsetX;
      var y = e.pageY - canvas.offsetTop - offsetY;

      // 判断是否已经开始绘画，把后面的画出来
      if( isDrawing ) {
        if ( isClicked ) {
        //  context.clearRect(0, 0, canvas.width, canvas.height);
          //drawRects();
          tmpRect.width = x - tmpRect.x;
          tmpRect.height = y - tmpRect.y;
          //var tmpRect = new Rect( tmpRectX, tmpRectY, tmpRectWidth, tmpRectHeight,tmpRectColor,tmpRectKind);
          //var tmpRect = new Rect( 0,0,100,100,"red", 1);
          //var tmpRect = new Rect( 0, 0, 100, 100, "red", 1);
          //alert( tmpRect.x + "," + tmpRect.y + "," + tmpRect.width + "," + tmpRect.height);
          //rects.push( tmpRect );
          drawRects(  );
          drawRect( tmpRect );
          //rects.splice( rects.length-1, 1);
        } 
      } else if( isScale ) {
        // 缩放的优先级较高
        changeScale( x, y );
        drawRects();

      } else if (isDragging) {  // 判断圆圈是否开始拖拽
          // 判断拖拽对象是否存在
          if (previousSelectedCircle != null) {
            // 将圆圈移动到鼠标位置
            //previousSelectedCircle.x = x - previousSelectedCircle.width / 2;
            //previousSelectedCircle.y = y - previousSelectedCircle.height / 2;
            previousSelectedCircle.x += x - clickPoint.x;
            previousSelectedCircle.y += y - clickPoint.y;
            //更新点击的点
            clickPoint = new BgPoint(x,y);

           // 更新画布
           
           //drawCircles();
           drawRects();
          }
      } else if (isDraggingBg) {
        if (previousSltBg != null) {
          backgrd[previousSltBg][0].x += x - clickPoint.x;
          backgrd[previousSltBg][0].y += y - clickPoint.y;
          //更新点击的点
          clickPoint = new BgPoint(x,y);
         // 更新画布
         drawRects();
        }
      }
       
    }

    function finishDrawing() {
      if( previousSelectedCircle != null ) {
        previousSelectedCircle.isSelected = false;
      }
      drawRects();
      var outImg = new Image();
      outImg = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      //console.log("hello");
      window.location.href = outImg;
    }
    function dataURItoBlob(dataURI) {
        // convert base64/URLEncoded data component to raw binary data held in a string
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(dataURI.split(',')[1]);
        else
            byteString = unescape(dataURI.split(',')[1]);

        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

        // write the bytes of the string to a typed array
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ia], {type:mimeString});
    }

    //*****背景碎石相关函数*****//
    var MaxLoopNum = 20000;
    //背景碎石相关参数
    var addBackGround = false; //是否添加背景，即撒上碎石
    var backgrd = [];  //存储背景里所有的东西
    var bgPoints = [];  //存储背景中的一个图形里所有的点，
    var bgCircles = []; //存储所有的背景圆
    var bgColor = "black"
    //背景圆的尺寸
    var R1 = 6;
    var R2 = 8;
    var R3 = 10;

    var Lmin1 = 1;
    var Lmin2 = 2;
    var Lmin3 = 3;

    var Lmax1 = 2;
    var Lmax2 = 4;
    var Lmax3 = 6;

    var num1 = 0;
    var num2 = 0;
    var num3 = 0;

    var Lmax = Lmax1;
    var Lmin = Lmin1;

    var PI = 3.141592653;

    function drawBackground() {
      var img = new Image();
      img.onload = function() {
      }
      for(var i = 0; i < backgrd.length; i ++) {
        drawBgPoints(backgrd[i]);
      }
      
    }

    function addGrain() {
      document.getElementById("jokhanAddGrain").disabled = true; 
      addBackGround = true;
      bgColor = tmpRect.color;
      for(var i = 0; i < num1; i ++) {
        Lmin = Lmin1;
        Lmax = Lmax1;
        createBgPoints(R1);
      }
      for(var i = 0; i < num2; i ++) {
        Lmin = Lmin2;
        Lmax = Lmax2;
        createBgPoints(R2);
      }
      for(var i = 0; i < num3; i ++) {
        Lmin = Lmin3;
        Lmax = Lmax3;
        createBgPoints(R3);
      }
      drawRects();
    }

    function createBgPoints( radius) {
      //以圆为依托生成凸多边形
      //radius--所依托圆的半径，可控制生成图形的面积大小
      var circleX, circleY, tmpCircle;
      var loopNum = 0;
      do {
        circleX = randomFromTo( radius + 1, canvas.width - radius - 1);
        circleY = randomFromTo( radius + 1, canvas.height - radius - 1);
        tmpCircle = new BgCircle(circleX, circleY, radius);
        if(loopNum > MaxLoopNum) {
          break;
        }
        loopNum ++;
      } while(!isNormalCircle(tmpCircle));
      bgCircles.push(tmpCircle);
      getAcuteTri(tmpCircle);
      backgrd.push(bgPoints);
    }

    function isNormalCircle(bgCircle) {
      //判断产生的圆是否为正常的，即不与其它圆相交
      var tmpPoint = new BgPoint(bgCircle.x, bgCircle.y);
      for(var i = 0; i < bgCircles.length; i ++) {
        var tmpPoint2 = new BgPoint(bgCircles[i].x, bgCircles[i].y);
        if(getDistance(tmpPoint, tmpPoint2) < (bgCircle.radius + bgCircles[i].radius)) {
          return false;
        }
      }
      return true;
    }

    function getAcuteTri(bgCircle) {
      //以背景圆为依托产生一个锐角三角形
      bgPoints = [];
      var head, a, a1, b, c;
      var r = bgCircle.radius;
      //取上半圆一个点作为锐角三角形的起始点a
      //var tmpX = randomFromTo(bgCircle.x - r, bgCircle.x + r);
      var tmpX = randomFromTo(bgCircle.x, bgCircle.x + r);
      var tmpY = calPos(tmpX, bgCircle, 1);
      //var tmpY = bgCircle.y + Math.floor(Math.sqrt(r * r - (tmpX - bgCircle.x) * (tmpX - bgCircle.x)));
      a = new BgPoint(tmpX, tmpY);
      bgPoints.push(a);
      //找到a的对称点坐标a1
      a1 = new BgPoint(2 * bgCircle.x - a.x, 2 * bgCircle.y - a.y);
      //在aa1左面找一点作为b, 将b点加入bgPoints
      tmpX = randomFromTo(bgCircle.x - r, Math.max(a.x, a1.x));
      //console.log(randomFromTo(0,1));
      switch(randomFromTo(0,1)) {
        case 0: {
          //取上半圆点，只需考虑aa1递减,(a->x < a1->x && b->y > a->y)递减  (a->x > a1->x && b->y < a1->y)递增
          //tmpY = bgCircle.y + Math.floor(Math.sqrt(r * r - (tmpX - bgCircle.x) * (tmpX - bgCircle.x)));
          tmpY = calPos(tmpX, bgCircle, 1);
          if(a.x - a1.x == 0 && tmpY - a.y >= 0)
            tmpY = calPos(tmpX, bgCircle, 0);
        };
        break;
        case 1: {
          //取下半圆点，只需考虑aa1递增
          tmpY = calPos(tmpX, bgCircle, 0);
          if(a.x - a1.x > 0 && tmpY - a1.y <= 0)
            tmpY = calPos(tmpX, bgCircle, 1);
        };
        break;
      }
      //存储相对于a的位置
      b = new BgPoint( tmpX - a.x, tmpY - a.y);
      bgPoints.push(b);

      //在aa1右面找一点作为c,使其是锐角三角形，有任何一个角为钝角都要重新找c点
      var b1 = new BgPoint(2 * bgCircle.x - tmpX, 2 * bgCircle.y - tmpY);
      tmpX = randomFromTo(a1.x, b1.x);
      //c放在下半圆上面
      tmpY = calPos(tmpX, bgCircle, 0);
      c = new BgPoint(tmpX - a.x, tmpY - a.y);
      /*
      do {
        //随机产生c点横坐标,min(a->x,a1->x)~(o.x + r) ,aa1递增还是递减 
        tmpX = randomFromTo(Math.min(a.x, a1.x), bgCircle.x + r);
        switch(randomFromTo(0,1)) {
          case 0: {
            tmpY = calPos(tmpX, bgCircle, 1);
            if(a.x - a1.x > 0 && tmpY - a.y >= 0)
              tmpY = calPos(tmpX, bgCircle, 0);
          };
          break;
          case 1: {
            tmpY = calPos(tmpX, bgCircle, 0);
            if(a.x - a1.x < 0 && tmpY - a1.y <= 0)
              tmpY = calPos(tmpX, bgCircle, 1);
          };
          break;
        }
        c = new BgPoint(tmpX, tmpY);
        if(pointEqual(a,c))
          continue;
        c = new BgPoint(tmpX - a.x, tmpY - a.y);
        var newA = new BgPoint(0,0);
        if(getCosAngle(newA,b,c) > 0 && getCosAngle(newA,c,b) > 0 && getCosAngle(b,newA,c) > 0)
          break;

      } while(1);
      */

      //存储c
      bgPoints.push(c);
      expand(bgPoints);
    }

    function expand(shape) {
      //多边形扩展
      var num = shape.length;  //现有顶点个数，边数
      var hasExpand = 0;       //是否扩展

      //找扩展点
      for( var i = 0; i < num; i ++) {
        var pos1 = getAbsPos(shape, i);
        var index2 = i < num - 1 ? i + 1 : 0;
        var pos2 = getAbsPos(shape, index2);
        if((getDistance(pos1, pos2) - Lmax) > 0){   //p1p2长大于限定边长
          if(getPoint(shape, i, index2) != null) {
            hasExpand = 1;
          }
        }
      }
    }

    //求p1p2经过p的发现与p1p2的交点m，是否满足mp1和mp2的长度大于Lmin
    function getNormalPoint(p1, p2, p) {
      var index = 0;
      var mp1 = 0;
      var mp2 = 0;
      mp1 = getDistance(p, p2) * getCosAngle(p, p2, p1);
      mp2 = getDistance(p, p1) * getCosAngle(p, p1, p2);
      if(mp1 > Lmin && mp2 > Lmin)
        index = 1;
      return index;
    }

    //判断找到的点p是否在凸多边形区域外
    function isInside(shape, p) {
      //0--在外面
      //1--在里面
      var inside = 1;
      if(shape.length == 3) {
        //单独处理三角形
        var point0 = getAbsPos(shape, 0);
        var point1 = getAbsPos(shape, 1);
        var point2 = getAbsPos(shape, 2);
        var Ssum = Math.abs(getS(point0, point1, point2));
        var SsumAno = Math.abs(getS(point0,p,point1)) + Math.abs(getS(point1,p,point2)) + Math.abs(getS(point2,p,point0));
        if(Math.abs(Ssum - SsumAno) < dev)
          return 1;
        else
          return 0;
      }
      for(var i = 0; i < shape.length; i ++) {
        var next = i < shape.length-1 ? i + 1 : 0;
        p1 = getAbsPos(shape, i);
        p2 = getAbsPos(shape, next);
        if (getS(p, p1, p2) < 0) {
          inside = 0;
          break;
        }
      }
      return inside;
    }

    //找index1-index2边的扩展点，并添加到shape中，若未找到返回空
    function getPoint(shape, index1, index2) {
      var num = 0;
      var p1 = getAbsPos(shape,index1);
      var p2 = getAbsPos(shape,index2);
      var index2Next = index2 < (shape.length - 1 ) ? index2 + 1 : 0;
      var index1Pre = index1 > 0 ? index1 - 1 : shape.length - 1;
      //console.log("getPoint-" + index2Next + ":" + index1Pre);
      do {
        var m = Math.random();
        var n = Math.random();
        var tmpX = 0.5 * (p1.x + p2.x) + 0.5 * getDistance(p1, p2) * m * Math.cos(2 * PI * n);
        var tmpY = 0.5 * (p1.y + p2.y) + 0.5 * getDistance(p1, p2) * m * Math.sin(2 * PI * n);

        tmpX = Math.floor(tmpX);
        tmpY = Math.floor(tmpY);

        var p = new BgPoint(tmpX, tmpY);
        if(getS(p, p2, getAbsPos(shape,index2Next)) > 0 && getS(p, getAbsPos(shape,index1Pre), p1) > 0 && getS(p1,p,p2) > 0 && getNormalPoint(p1, p2, p) == 1 && isInside(shape, p) == 0) {
          p = new BgPoint(tmpX - shape[0].x, tmpY - shape[0].y);
          //console.log("P:("+p.x+","+p.y+")");
          //console.log("P1:("+p1.x+","+p1.y+")");
          //console.log("P2:("+p2.x+","+p2.y+")");
          //console.log("("+tmpX+","+tmpY+")");
          if(index2 == 0) {
            //防止破坏第一个元素
            shape.push(p);
          } else {
            shape.splice(index2, 0, p);
          }
          break;
        }
        if(num++ > MaxLoopNum) {
          p = null;
          break;
        }

      } while(1);
      return p;
    }

    function drawBgPoints(shape) {
      //多边形的第一个坐标为固定坐标，其它点是以第一个点为原点的相对坐标
      if(shape.length < 3) {
        return;
      }
      context.beginPath();
      context.moveTo(shape[0].x, shape[0].y);
      //console.log("(0):" +shape[0].x +"," + shape[0].y);
      for( var i = 1; i < shape.length; i ++ ) {
        //var tmpX = shape[0].x + shape[i].x;
        //var tmpY = shape[0].y + shape[i].y;
        //context.lineTo(tmpX, tmpY);
        var pos = getAbsPos(shape,i);
        context.lineTo(pos.x, pos.y);
        //console.log("("+i+"):"+pos.x+","+pos.y);
      }
      context.lineTo(shape[0].x, shape[0].y);
      context.closePath();
      context.fillStyle=bgColor;
      //context.fillStyle="red";
      context.fill();
    }


    //将点的相对坐标转化为绝对坐标
    function getAbsPos(shape, index) {
      //console.log(index);
      if(index < 0 || index >= shape.length)
        return;
      else if(index == 0)
        return shape[0];
      else {
        var result = new BgPoint(shape[0].x + shape[index].x, shape[0].y + shape[index].y);
        return result;
      }
    }

    //根据横坐标求一个圆上的另一个坐标
    function calPos(x,bgCircle,up) {
      //x--横坐标
      //bgCircle--圆的位置
      //up--是否求上半圆的点，1为上半圆，0为下半圆
      var flag = 0;
      if( up == 1)
        flag = -1;
      else if (up == 0 )
        flag = 1;
      else
        alert("calPos error");
      var tmp = Math.floor(Math.sqrt(bgCircle.radius * bgCircle.radius - (x - bgCircle.x) * (x - bgCircle.x)));
      return bgCircle.y + flag * tmp;
    }

    //判断两个点是否相等
    function pointEqual(one, another) {
      if( one.x == another.x && one.y == another.y)
        return true;
      else
        return false;
    }

    //计算两点的距离
    function getDistance(a,b) {
      return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    }

    //计算余弦角度
    function getCosAngle(a,b,c) {
      var cosAngle = 0;
      //var newA = new BgPoint(0,0);
      //b,c是a的相对坐标
      var Lab = getDistance(a,b);
      var Lac = getDistance(a,c);
      var Lbc = getDistance(b,c);
      if(Lab <= 0 || Lbc <= 0)
        return 0;
      cosAngle = (Lab * Lab + Lbc * Lbc - Lac * Lac) / (2 * Lab * Lbc);
      //console.log(cosAngle);
      return cosAngle;
    }

    //多边形面积行列式计算
    function getS(a,b,c) {
      return 0.5 * (a.x * b.y + b.x * c.y + c.x * a.y - c.x * b.y - b.x * a.y - a.x * c.y);
    }


