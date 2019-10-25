(function() {
  var elements = {
    dragger: {
      locator: document.getElementsByClassName("dragger")[0],
      resizer: document.getElementsByClassName("dragger__resizer")[0],
      isSelected: false,
      setSelected: function(value) {
        this.isSelected = value;
      }
    },
    slider: {
      line: document.getElementsByClassName("slider")[0],
      getSliderWidth: function() {
        return parseFloat(getComputedStyle(this.line).width);
      }
    },
    filler: document.getElementsByClassName("slider__filled")[0],
    balloon: {
      locator: document.getElementsByClassName("balloon")[0],
      rotator: document.getElementsByClassName("balloon__rotator")[0],
      resizer: document.getElementsByClassName("balloon__resizer")[0],
      text: document.getElementsByClassName("balloon__text")[0]
    }
  };
  var physics = {
    DIRECTION: {
      BACKWARD: "backward",
      FORWARD: "forward",
      STOP: "stop"
    },
    prev: {
      time: new Date().getTime(),
      position: 0,
      speed: 0,
      acceleration: 0
    },
    currentPosition: 0,
    setPosition: function(position) {
      this.currentPosition = position;
    },
    getDuration: function(prev) {
      var time = new Date().getTime();
      var deltaTime = time - prev.time;
      prev.time = time;
      return deltaTime;
    },
    getDirection: function(deltaPosition) {
      var direction;
      if (deltaPosition < 0) direction = this.DIRECTION.BACKWARD;
      else if (deltaPosition > 0) direction = this.DIRECTION.FORWARD;
      else direction = this.DIRECTION.STOP;
      return direction;
    },
    getSpeed: function(prev, distance, duration) {
      var speed = distance / duration;
      var deltaSpeed = speed - prev.speed;
      prev.speed = speed;
      return Math.abs(deltaSpeed);
    },
    getAcceleration: function(prev, speed, duration) {
      var acceleration = speed / duration;
      var deltaAcceleration = acceleration - prev.acceleration;
      prev.acceleration = acceleration;
      return Math.abs(deltaAcceleration);
    },
    getVariables: function() {
      var duration = this.getDuration(this.prev);

      var deltaPosition = this.currentPosition - this.prev.position;

      var direction = this.getDirection(deltaPosition);

      var distance = Math.abs(deltaPosition);

      this.prev.position = this.currentPosition;

      var speed = this.getSpeed(this.prev, distance, duration);

      var acceleration = this.getAcceleration(this.prev, speed, duration);

      var variables = {
        direction,
        speed,
        acceleration        
      };

      return variables;
    }
  };

  elements.dragger.locator.addEventListener("mousedown", function() {
    elements.dragger.setSelected(true)
  });
  document.body.addEventListener("mouseup", function() {
    elements.dragger.setSelected(false)
  });
  elements.dragger.locator.addEventListener("mousemove", function(event) {
    physics.setPosition(event.layerX);
  });
  elements.slider.line.addEventListener("mousemove", function(event) {
    physics.setPosition(event.layerX);
  });

  function run60FPS() {
    var variables = physics.getVariables();
    updateElementsState(variables);
    requestAnimationFrame(run60FPS);
  }

  function resetElements() {
    elements.balloon.rotator.style.transform = "rotate(0deg)";
    elements.dragger.resizer.style.transform = "scale(1)";
  }
  function updateSlider(state) {
    elements.filler.style.transform = `translate(${state.position - elements.slider.getSliderWidth()}px)`;
    elements.dragger.locator.style.transform = `translate(${state.position -
      12}px , -50%)`; // dragger width is 24 px -> state.position - 12 = calc(state.position - 50%);
    elements.dragger.resizer.style.transform = `scale(1.5)`;
  }

  function updateBalloon(state) {
    var balloonScale = state.percent * 0.5 + 1;
    var directionSign = state.physicsVariables.direction === physics.DIRECTION.FORWARD ? -1 : +1;
    var degree = 30 * directionSign * state.physicsVariables.acceleration * 100; // 45 is max Degree, 100 for scale up acceleration
    elements.balloon.locator.style.transform = `translateX(${state.position - 30}px)`;
    elements.balloon.resizer.style.transform = `scale(${balloonScale})`;
    elements.balloon.rotator.style.transform = `rotate(${degree}deg)`;
    elements.balloon.text.innerHTML = parseInt(state.percent * 100);
  }
  function updateElementsState(variables) {
    var isPositionInRange = physics.currentPosition >= 0 && physics.currentPosition <= elements.slider.getSliderWidth();
    var shouldUpdate = elements.dragger.isSelected && isPositionInRange;
    var shouldReset = variables.direction === physics.DIRECTION.STOP;
    if(shouldReset || !shouldUpdate){
      resetElements();
      return;
    }
    var positionPercent = physics.currentPosition / elements.slider.getSliderWidth();

    updateSlider({
      position: physics.currentPosition,
    });

    updateBalloon({
      position: physics.currentPosition,
      physicsVariables: variables,
      percent: positionPercent
    });
  }

  requestAnimationFrame(run60FPS);
})();
