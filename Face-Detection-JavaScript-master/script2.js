const video = document.getElementById('video')

Promise.all([
  //faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models'),
  faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)


function startVideo() {
  navigator.getUserMedia(
    { video: { frameRate: { ideal: 10, max: 10 } } },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('playing', async () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  const labeledFaceDescriptors = await loadLabeledImages()
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.5)



  setInterval(async () => {
    const result2 = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections =  faceapi.resizeResults(result2, displaySize)
    const results=resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    console.log(results)

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    

  
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
      drawBox.draw(canvas)
    })
    
    
    //faceapi.draw.drawDetections(canvas, resizedDetections)
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 500)
})


function loadLabeledImages() {
    const labels = ['kai', 'simon', '韓總機征服宇宙']
    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 1; i++) {
          const img = await faceapi.fetchImage(`/data/${label}/${i}.jpg`)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
  
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }
