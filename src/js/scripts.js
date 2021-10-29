import {
  volumeMute,
  volumeLow,
  volumeMedium,
  volumeHight,
  iconPause,
  iconPauseLarge,
  iconPlay,
  iconPlayLarge,
  expanded,
  compress,
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
  const videoCanvas = document.getElementById('videoCanvas');
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
  const cover = document.getElementById('cover');
  const controls = document.getElementById('controls');
  const preview = document.getElementById('preview');
  const timeVideo = document.getElementById('time-video');

  statusVolume.innerHTML = getStatusVolue();
  btnPlay.innerHTML = iconPlay;
  fullScreen.innerHTML = expanded;
  sliderVol.value = localStorage.getItem('volume');
  controls.style.opacity = 0;
  progressBar.style.opacity = 0;

  video.src = spiderMovie;
  videoCanvas.src = spiderMovie;
  let statusHover, statusPlayPauseVideo = false

  let inialIntervalTime = null;
  let inialIntervalPreview, 
    timeDisplayNone, 
    timeDisplayFlex, 
    timeTransitionZero = null;
    
  let statusScreen = 1;
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

    if(statusPlayPauseVideo) {
      video.play();
      btnPlay.innerHTML = iconPause;
    }


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
    cover.style.opacity = 1;

    let teste = setTimeout(() => {
      cover.style.opacity = 0;
    }, 1000)

    if(video.paused) {
      video.play();

      btnPlay.innerHTML = iconPause;
      cover.innerHTML = iconPlayLarge;
      statusPlayPauseVideo = true

      intervalTime = setInterval(updateTime, 100);
    } else {
      video.pause();
      statusPlayPauseVideo = false

      btnPlay.innerHTML = iconPlay;
      cover.innerHTML = iconPauseLarge;

      clearInterval(intervalTime);
      clearTimeout(teste)
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
    ' / ' + convertTime(hour, min, seg);
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
      ' / ' + convertTime(hour, min, seg);
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

    if(statusScreen === 1) {
      fullScreen.innerHTML = compress
      statusScreen= 2
    } else {      
      fullScreen.innerHTML = expanded
      statusScreen= 1
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
    cover.addEventListener('click', play);
    video.addEventListener('waiting', loader);
    video.addEventListener('playing', loader);
    statusVolume.addEventListener('click', muted);
    sliderVol.addEventListener('input', changeVolume);
    fullScreen.addEventListener('click', changeFullScreen)
    cover.addEventListener('dblclick', changeFullScreen);

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
      ' / ' + convertTime(hour, min, seg);
    }, 800);
  }

  progressBar.addEventListener('mousemove', (e) => {
 
    pctBar = (e.offsetX / progressBar.clientWidth) * 100;

    currentHour = Math.floor(((video.duration * pctBar) / 100) / 3600);
    currentMin = Math.floor(((video.duration * pctBar) / 100) / 60);
    currentSeg = Math.floor(((((video.duration * pctBar) / 100) / 60) % 1) * 60);

    pctSeek = (video.currentTime / video.duration) * 100;

    let newVideo = videoCanvas
    // newVideo
    newVideo.currentTime = (video.duration * pctBar) / 100;

    if(e.offsetX >= 75 && e.offsetX <= progressBar.clientWidth - 75) {
      preview.style.marginLeft = e.offsetX-75+'px';
    }
    
    var canvas = document.getElementById("canvas");
    canvas.height = videoCanvas.videoHeight;
    canvas.width = videoCanvas.videoWidth;
    var context = canvas.getContext('2d');
    context.drawImage(videoCanvas, 0, 0)

    if(!statusHover) {
      preview.style.display = 'flex';
      

      timeDisplayFlex = setTimeout(() => {
        preview.style.transition = '1s';
        preview.style.opacity = '1';
      }, 1000)

      timeTransitionZero = setTimeout(() => {
        preview.style.transition = '0s';
      }, 1000)
    }

    // clearTimeout(timeDisplayFlex)    
    // clearTimeout(timeTransitionZero)   

    statusHover = true;
    clearTimeout(inialIntervalPreview)
    clearTimeout(timeDisplayNone)

    timeVideo.innerHTML = convertTime(currentHour, currentMin, currentSeg);
  })

  progressBar.addEventListener('mouseout', () => {
    inialIntervalPreview = setTimeout(() => {
      preview.style.transition = '1s';
      preview.style.opacity = '0';
      statusHover = false
    }, 200)

    timeDisplayNone = setTimeout(() => {
      preview.style.display = 'none';
      preview.style.transition = '0s';
    }, 3000)
  })

  videoContainer.addEventListener('mouseover', (e) => {
    controls.style.opacity = '1'
    progressBar.style.opacity = '1'
    controls.style.transition = '1s'
    progressBar.style.transition = '1s'

    clearInterval(inialIntervalTime)
  });

  videoContainer.addEventListener('mouseout', (e) => {
    inialIntervalTime = setInterval(() => {
      controls.style.opacity = '0'
      progressBar.style.opacity = '0'
      controls.style.transition = '2s'
      progressBar.style.transition = '2s'
    }, 1000);
  })

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
  videoCanvas.addEventListener('loadeddata', loadVideo);
})();