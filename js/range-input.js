for (let e of document.querySelectorAll('input[type="range"].slider-progress')) {
  e.style.setProperty('--value', e.value)
  e.style.setProperty('--min', e.min == '' ? '0' : e.min)
  e.style.setProperty('--max', e.max == '' ? '100' : e.max)
  e.addEventListener('input', () => e.style.setProperty('--value', e.value))
  VolumeLevelControlElement.addEventListener("click", () => e.style.setProperty('--value', e.value))
  document.addEventListener('keydown', () => e.style.setProperty('--value', e.value))
  buttonVolumeElement.addEventListener("dblclick", () => e.style.setProperty('--value', e.value))
  buttonVolumeElement.addEventListener("click", () => e.style.setProperty('--value', e.value))
}
