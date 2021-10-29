import {
  volumeMute,
  volumeLow,
  volumeMedium,
  volumeHight,
  iconPause,
  iconPlay,
  expanded,
  spiderMovie
} from '../assets'

(function () {
  if(!localStorage.getItem('volume')) {
    localStorage.setItem('volume', 1);
  }

  if(localStorage.getItem('muted') === null) {
    localStorage.setItem('muted', false);
  }

  const width = window.innerWidth;

  const uploadButton = document.getElementById('uploadButton');
  const inputUploadVideo = document.getElementById('input_upload_video');
  const video = document.getElementById('video');
  const loading = document.getElementById('loading');
  const statusVolume = document.getElementById('status-volume');
  const btnPlay = document.getElementById('btn-play');
  const fullScreen = document.getElementById('full-screen');
  const videoLoader = document.getElementById('video-loader');
  const progressBar = document.getElementById('progress-bar');
  const videoProgress = document.getElementById('video-progress');
  const timer = document.getElementById('video-time');
  const sliderVol = document.getElementById('slider-vol');
  const videoContainer = document.getElementById('video-container');

  statusVolume.innerHTML = getStatusVolue();
  btnPlay.innerHTML = iconPlay;
  fullScreen.innerHTML = expanded;
  sliderVol.value = localStorage.getItem('volume');

  video.src = spiderMovie;

  let intervalTime,
    hour, 
    min, 
    seg, 
    currentHour, 
    currentMin, 
    currentSeg, 
    bufferEnd,
    pctSeek,
    pctBar;

      
  function dragMove(e) {    
    if(width<800) {
      if (e.touches[0].clientX <= progressBar.clientWidth) {
        pctBar = (e.touches[0].clientX / progressBar.clientWidth) * 100;
        video.currentTime = (video.duration * pctBar) / 100;
        
        return videoProgress.style.width = String(e.touches[0].clientX)+'px';
      }
    } else {
      pctBar = (e.offsetX / progressBar.clientWidth) * 100;
      video.currentTime = (video.duration * pctBar) / 100;
      
      return videoProgress.style.width = String(e.offsetX)+'px';     
    }
  }

  function dragEnd() {
    progressBar.removeEventListener('mousemove', dragMove);
    progressBar.removeEventListener('mouseup', dragEnd);

    progressBar.removeEventListener('touchmove', dragMove);
    progressBar.removeEventListener('touchend', dragEnd);

    video.play();

    btnPlay.innerHTML = iconPause;

    intervalTime = setInterval(updateTime, 100);
  }

  function dragStart(e) {
    video.pause();
    clearInterval(intervalTime);

    if(width>800) {
      progressBar.addEventListener('mousemove', dragMove);
      progressBar.addEventListener('mouseup', dragEnd);
    } else {      
      progressBar.addEventListener('touchmove', dragMove);
      progressBar.addEventListener('touchend', dragEnd);
    }
  }

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function play(e) {
    btnPlay.innerHTML = '';
    
    if(video.paused) {
      video.play();

      btnPlay.innerHTML = iconPause;

      intervalTime = setInterval(updateTime, 100);
    } else {
      video.pause();

      btnPlay.innerHTML = iconPlay;

      clearInterval(intervalTime);
    }
  }
  
  function convertTime(horas, minutos, segundos) {
    if(horas < 10 && horas > 0) {
      horas = '0' + String(horas) + ":";
    } else {
      horas = '';
    }

    if(minutos < 10) {
      minutos = '0' + String(minutos);
    } else if(minutos > 59){
      minutos = minutos - (Math.floor(minutos/60) *60);
    }

    if(segundos < 10) {
      segundos = '0' + String(segundos);
    }

    return String(horas) + String(minutos) + ':' + String(segundos)
  }

  function updateTime(init) {
    if(!init) {
      bufferEnd = video.buffered.end(video.buffered.length - 1)

      videoLoader.style.width = String((bufferEnd / video.duration) * 100)+ '%';

      pctSeek = (video.currentTime / video.duration) * 100;

      videoProgress.style.width = String(pctSeek) + '%'
    }
    

    hour = Math.floor(video.duration / 3600);
    min = Math.floor(video.duration / 60)
    seg = Math.floor(((video.duration / 60) % 1) * 60)

    currentHour = Math.floor(video.currentTime / 3600);
    currentMin = Math.floor(video.currentTime / 60);
    currentSeg = Math.floor(((video.currentTime / 60) % 1) * 60);

    if(currentSeg > 0 && currentSeg < 2) {
      progressBar.style.overflow = 'initial !important'
    }

    timer.innerHTML = convertTime(currentHour, currentMin, currentSeg) +
    ' | ' + convertTime(hour, min, seg);
  }
  
  function loader(event) {
    switch(event.type) {
      case 'waiting':
        loading.style.display = 'flex'
      break;
      case 'playing':
        loading.style.display = 'none'
      break;
      default:
        console.log('loader')
    }
  }

  function seeker(event) {
    pctBar = (event.offsetX / progressBar.clientWidth) * 100;
    video.currentTime = (video.duration * pctBar) / 100;

    currentHour = Math.floor(((video.duration * pctBar) / 100) / 3600);
    currentMin = Math.floor(((video.duration * pctBar) / 100) / 60);
    currentSeg = Math.floor(((((video.duration * pctBar) / 100) / 60) % 1) * 60);

    pctSeek = (video.currentTime / video.duration) * 100;

    videoProgress.style.width = String(pctSeek) + '%'

    timer.innerHTML = convertTime(currentHour, currentMin, currentSeg) +
      ' | ' + convertTime(hour, min, seg);
  }

  function muted() {
    if(video.muted) {
      statusVolume.innerHTML = volumeHight;
      video.muted = false;
      localStorage.setItem('muted', false);
    } else {
      statusVolume.innerHTML = volumeMute;
      video.muted = true;
      localStorage.setItem('muted', true);
    }
  }

  function changeVolume(e) {
    let icon = ''
    const volToNumer = parseFloat(e.target.value); 
    const mutedStatus = JSON.parse(localStorage.getItem('muted'));

    if(mutedStatus) {
      icon = volumeMute
    } else {
      if(volToNumer > 0.74) {
        icon = volumeHight
      } else if (volToNumer > 0.24 && volToNumer < 0.75) {
        icon = volumeMedium
      } else if (volToNumer > 0.01 && volToNumer < 0.25) {
        icon = volumeLow 
      } else if (volToNumer === 0) {
        icon = volumeMute
      }
    }

    video.volume = volToNumer
    localStorage.setItem('volume', volToNumer)
    statusVolume.innerHTML = icon;
  }

  function getStatusVolue() {
    let icon = ''
    const mutedStatus = JSON.parse(localStorage.getItem('muted'));
    const volToNumer = parseFloat(localStorage.getItem('volume'));

    if(mutedStatus) {
      icon = volumeMute
    } else {
      if(volToNumer > 0.74) {
        icon = volumeHight
      } else if (volToNumer > 0.24 && volToNumer < 0.75) {
        icon = volumeMedium
      } else if (volToNumer > 0.01 && volToNumer < 0.25) {
        icon = volumeLow 
      } else if (volToNumer === 0) {
        icon = volumeMute
      }
    }

    return icon;  
  }

  function changeFullScreen() {
    if (!document.fullscreenElement &&    // alternative standard method
    !document.mozFullScreenElement && 
    !document.webkitFullscreenElement && 
    !document.msFullscreenElement) {  // current working methods
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      } else if (videoContainer.mozRequestFullScreen) {
        videoContainer.mozRequestFullScreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  function loadVideo() {
    if(width > 800) {
      videoProgress.addEventListener('mousedown', dragStart);
    } else {
      videoProgress.addEventListener('touchstart', dragStart);
    }    

    progressBar.addEventListener('click', seeker)
    btnPlay.addEventListener('click', play);
    video.addEventListener('click', play);
    video.addEventListener('waiting', loader);
    video.addEventListener('playing', loader);
    statusVolume.addEventListener('click', muted);
    sliderVol.addEventListener('input', changeVolume);
    fullScreen.addEventListener('click', changeFullScreen)
    video.addEventListener('dblclick', changeFullScreen);

    video.muted = JSON.parse(localStorage.getItem('muted'));
    sliderVol.value = localStorage.getItem('volume');
    btnPlay.innerHTML = iconPlay;
    loading.style.display = 'none';

    setTimeout(() => {
      hour = Math.floor(video.duration / 3600);
      min = Math.floor(video.duration / 60)
      seg = Math.floor(((video.duration / 60) % 1) * 60)

      currentHour = Math.floor(video.currentTime / 3600);
      currentMin = Math.floor(video.currentTime / 60);
      currentSeg = Math.floor(((video.currentTime / 60) % 1) * 60);

      timer.innerHTML = convertTime(currentHour, currentMin, currentSeg) +
      ' | ' + convertTime(hour, min, seg);
    }, 800);
  }

  uploadButton.addEventListener('click', () => {
    inputUploadVideo.click();
  });

  inputUploadVideo.addEventListener('change', (e) => {
    const { files } = e.target;

    loading.style.display = 'flex';
    
    getBase64(files[0]).then(data => {
      video.src = data;

      progressBar.removeEventListener('click', seeker)
      videoProgress.removeEventListener('mousedown', dragStart);
      videoProgress.removeEventListener('touchstart', dragStart);
      btnPlay.removeEventListener('click', play);
      video.removeEventListener('click', play);
      video.removeEventListener('waiting', loader);
      video.removeEventListener('playing', loader);
      statusVolume.removeEventListener('click', muted);
      sliderVol.removeEventListener('input', changeVolume);
      fullScreen.removeEventListener('click', changeFullScreen)
    });
  });

  video.addEventListener('loadeddata', loadVideo);
})();