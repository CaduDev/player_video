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
  expandPicInPic,
  compressPicInPic,
  configurationIcon,
} from '../assets'

(function () {
  if(!localStorage.getItem('volume')) {
    localStorage.setItem('volume', 1);
  }
  
  if(localStorage.getItem('muted') === null) {
    localStorage.setItem('muted', false);
  }
  
  let videoForTest = [
    // {
    //   cover: 'url of thumbnail of movie',
    //   title: 'title of movie',
    //   description: 'desciption (opcional)',
    //   duration: 'duration of movie',
    //   data: 'date of upload movie',
    //   author: 'name of author',
    //   url: 'url of movie'
    // },
  ];

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
  const cover = document.getElementById('cover');
  const controls = document.getElementById('controls');
  const preview = document.getElementById('preview');
  const timeVideo = document.getElementById('time-video');
  const picInPic = document.getElementById('pic-in-pic');
  const removePicInPic = document.getElementById('remove-pic-in-pic');
  const buttonConfiguration = document.getElementById('button-configuration');
  const contentConfiguration = document.getElementById('content-configuration');
  const quality = document.getElementById('quality');
  const speed = document.getElementById('speed');
  const contentRight = document.getElementById('right');

  statusVolume.innerHTML = getStatusVolue();
  btnPlay.innerHTML = iconPlay;
  fullScreen.innerHTML = expanded;
  picInPic.innerHTML = compressPicInPic;
  removePicInPic.innerHTML = expandPicInPic;
  sliderVol.value = localStorage.getItem('volume');
  buttonConfiguration.innerHTML = configurationIcon
  controls.style.opacity = 0;
  progressBar.style.opacity = 0;

  video.src = null;
  // videoCanvas.src = null;
  let statusHover, statusPlayPauseVideo, statusPicInPic = false

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
    pctBar, 
    videoPreview;
      
  function dragMove(e) {    
    if(width<800) {
      if (e.changedTouches[0].clientX <= progressBar.clientWidth) {
        pctBar = (e.changedTouches[0].clientX / progressBar.clientWidth) * 100;
        video.currentTime = (video.duration * pctBar) / 100;
        
        return videoProgress.style.width = String(e.changedTouches[0].clientX)+'px';
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
    showConfiguration({ justHide: true });

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
    showConfiguration({ justHide: true });

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
    showConfiguration({ justHide: true });

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
    showConfiguration({ justHide: true });

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
    showConfiguration({ justHide: true });

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
    showConfiguration({ justHide: true });

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

    progressBar.addEventListener('mousemove', changePreview)
    progressBar.addEventListener('mouseout', ocultePreview)
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
    sliderVol.value = parseFloat(localStorage.getItem('volume'));
    video.volume = parseFloat(localStorage.getItem('volume'));
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

  function changePreview(e) {
    if(!videoPreview) {
      videoPreview = video.cloneNode(true)
    }
 
    pctBar = (e.offsetX / progressBar.clientWidth) * 100;

    currentHour = Math.floor(((video.duration * pctBar) / 100) / 3600);
    currentMin = Math.floor(((video.duration * pctBar) / 100) / 60);
    currentSeg = Math.floor(((((video.duration * pctBar) / 100) / 60) % 1) * 60);

    pctSeek = (video.currentTime / video.duration) * 100;

    let newVideo = videoPreview

    // newVideo
    newVideo.currentTime = (video.duration * pctBar) / 100;

    if(e.offsetX >= 75 && e.offsetX <= progressBar.clientWidth - 75) {
      preview.style.marginLeft = e.offsetX-75+'px';
    }
    
    var canvas = document.getElementById("canvas");
    canvas.height = newVideo.videoHeight;
    canvas.width = newVideo.videoWidth;
    var context = canvas.getContext('2d');
    context.drawImage(newVideo, 0, 0)

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
  }

  function ocultePreview() {
    inialIntervalPreview = setTimeout(() => {
      preview.style.transition = '1s';
      preview.style.opacity = '0';
      statusHover = false
    }, 200)

    timeDisplayNone = setTimeout(() => {
      preview.style.display = 'none';
      preview.style.transition = '0s';
    }, 3000)
  }

  function setPicInPic() {
    showConfiguration({ justHide: true });

    if(!statusPicInPic) {
      videoContainer.classList.add('mini-player');
      picInPic.innerHTML = expandPicInPic;
      statusPicInPic = true;
      controls.style.display = 'none';
      progressBar.style.marginBottom = '20px';
      removePicInPic.style.display = 'flex';
      
      progressBar.removeEventListener('mousemove', changePreview)
      progressBar.removeEventListener('mouseout', ocultePreview)
    } else {
      videoContainer.classList.remove('mini-player');
      picInPic.innerHTML = compressPicInPic;
      statusPicInPic = false;
      controls.style.display = 'block';
      progressBar.style.marginBottom = '0px';
      removePicInPic.style.display = 'none';

      progressBar.addEventListener('mousemove', changePreview)
      progressBar.addEventListener('mouseout', ocultePreview)
    }
  }

  function showControls(e) {
    controls.style.opacity = '1'
    progressBar.style.opacity = '1'
    controls.style.transition = '1s'
    progressBar.style.transition = '1s'

    clearInterval(inialIntervalTime)
  }

  function hiddenControls(e) {
    inialIntervalTime = setInterval(() => {
      controls.style.opacity = '0'
      progressBar.style.opacity = '0'
      controls.style.transition = '2s'
      progressBar.style.transition = '2s'
    }, 1000);
  }

  function clickButtonFileVideo() {
    inputUploadVideo.click();
  }

  function uploadFile(e) {
    const { files } = e.target;

    if(files.length > 0) {
      loading.style.display = 'flex';
      
      getBase64(files[0]).then(data => {
        fetch(data).then(response => {
          response.blob().then(blob => {
            video.src = URL.createObjectURL(blob) ;

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
          })
        }) 

        // videoCanvas.src = data;
  

      });
    }

  }

  function showConfiguration({ justHide }) {
    
    if(contentConfiguration.style.display === 'block') {
      contentConfiguration.style.display = 'none'

      speed.style.display = 'block'
      speed.children[0].style.display = 'block'
      speed.children[1].style.display = 'none'

      quality.style.display = 'block'
      quality.children[0].style.display = 'block'
      quality.children[1].style.display = 'none'
    } else {
      if(justHide) {
        contentConfiguration.style.display = 'none'

        speed.style.display = 'block'
        speed.children[0].style.display = 'block'
        speed.children[1].style.display = 'none'
  
        quality.style.display = 'block'
        quality.children[0].style.display = 'block'
        quality.children[1].style.display = 'none'      
      } else {
        contentConfiguration.style.display = 'block'
      }
    }
  }

  function selectSectionConfiguration(e) {
    if(e.target.className === 'quality-selected') {
      let span = speed

      span.style.display = 'none';

      e.target.style.display = 'none';
      quality.children[1].style.display = 'block';

      for (var i = 0, len = quality.children[1].childNodes.length; i < len; i++) {
        quality
          .children[1]
          .childNodes[i]
          .addEventListener('click', (element) => setNewValueConfig(element, e.target.className));
      }
      
    } else if(e.target.className === 'speed-selected') {
      let span = quality

      span.style.display = 'none';

      e.target.style.display = 'none';
      speed.children[1].style.display = 'block';

      for (var i = 0, len = speed.children[1].childNodes.length; i < len; i++) {
        speed
          .children[1]
          .childNodes[i]
          .addEventListener('click', (element) => setNewValueConfig(element, e.target.className));
      }
    }
  }

  function setNewValueConfig(e, type) {
    if(type === 'quality-selected') {
      quality.children[0].innerText = e.target.innerText
    } else {
      speed.children[0].innerText = e.target.innerText
      changedSpeed(e.target.innerText.split('x')[0])
    }  
      speed.style.display = 'block'
      speed.children[0].style.display = 'block'
      speed.children[1].style.display = 'none'

      quality.style.display = 'block'
      quality.children[0].style.display = 'block'
      quality.children[1].style.display = 'none'
  }

  function changedSpeed(e) {
    if(e !== 'Normal') {
      video.playbackRate = parseFloat(e)
    } else {
      video.playbackRate = 1.0
    }
  }

  function getEelment(element, className) {
    const newElement = document.createElement(element);

    if(className) {
      newElement.className = className;
    }

    return newElement
  }

  function getCardVideo(e) {

    const container = getEelment('div', 'item');
    const thumbnail = getEelment('div', 'thumbnail');
    thumbnail.style.backgroundImage = `url(${e.cover})`
    const info = getEelment('div', 'info');
    const title = getEelment('div', 'title');
    title.appendChild(document.createTextNode(e.title))
    const description = getEelment('div', 'description');
    description.appendChild(document.createTextNode(e.description))
    const author = getEelment('div', 'author');
    author.appendChild(document.createTextNode(e.author))
    const timeAndData = getEelment('div', 'time-and-data');
    const spanDuration = getEelment('span');
    spanDuration.appendChild(document.createTextNode(e.duration))
    const spanData = getEelment('span');
    spanData.appendChild(document.createTextNode(e.data))


    container.addEventListener('click', (element) => {
      video.src = e.url;
      // videoCanvas.src = e.url;
    })

    timeAndData.appendChild(spanDuration)
    timeAndData.appendChild(spanData)
    info.appendChild(title)
    info.appendChild(description)
    info.appendChild(author)
    info.appendChild(timeAndData)
    container.appendChild(thumbnail)
    container.appendChild(info)

    return container
  }

  function loadOtherVideo() {
    videoForTest.map((e) => {
      contentRight.appendChild(getCardVideo(e))
    })
  }

  videoContainer.addEventListener('mouseover', showControls);
  videoContainer.addEventListener('mouseout', hiddenControls)
  uploadButton.addEventListener('click', clickButtonFileVideo);
  inputUploadVideo.addEventListener('change', uploadFile);
  buttonConfiguration.addEventListener('click', showConfiguration);
  quality.addEventListener('click', selectSectionConfiguration)
  speed.addEventListener('click', selectSectionConfiguration)

  picInPic.addEventListener("click", setPicInPic);
  removePicInPic.addEventListener("click", setPicInPic);
  video.addEventListener('loadeddata', loadVideo);
  // videoCanvas.addEventListener('loadeddata', loadVideo);

  loadOtherVideo();
})();