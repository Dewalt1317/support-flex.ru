const sliders = document.querySelectorAll('input[type="range"].slider-progress');

sliders.forEach((slider) => {
  slider.style.setProperty('--value', slider.value);
  slider.style.setProperty('--min', slider.min || '0');
  slider.style.setProperty('--max', slider.max || '100');

  const updateValue = () => {
    slider.style.setProperty('--value', slider.value);
  };

  slider.addEventListener('input', updateValue);
  slider.addEventListener('click', updateValue);
  document.addEventListener('keydown', updateValue);

  VolumeLevelControlElement.addEventListener('click', updateValue);
  buttonVolumeElement.addEventListener('dblclick', updateValue);
  buttonVolumeElement.addEventListener('click', updateValue);
});
