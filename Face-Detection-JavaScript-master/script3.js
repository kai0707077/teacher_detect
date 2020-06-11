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
    { video: { frameRate: { ideal: 5, max: 5 } } },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}


video.addEventListener('playing', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  // const img = faceapi.fetchImage('https://upload.wikimedia.org/wikipedia/commons/6/6a/%E9%AB%98%E9%9B%84%E5%B8%82%E9%95%B7_%E9%9F%93%E5%9C%8B%E7%91%9C.jpg')
  // const result =   faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()
  // if (!result.length) {
  //   return
  // }
  // const faceMatcher = new faceapi.FaceMatcher(result)
  // const bestMatch=0

  setInterval(async () => {
    //-----------------------------------------------------------------------------
    const img =  await  faceapi.fetchImage('https://upload.wikimedia.org/wikipedia/commons/6/6a/%E9%AB%98%E9%9B%84%E5%B8%82%E9%95%B7_%E9%9F%93%E5%9C%8B%E7%91%9C.jpg')
    
    const Descriptors =  await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()
    // if (!Descriptors.length) {
    //   return
    // }
    // const faceMatcher = new faceapi.FaceMatcher(result)
    const descriptorsHan = [new Float32Array(Descriptors[0].descriptor)]
    const labeledDescriptors = [new faceapi.LabeledFaceDescriptors('韓總機', descriptorsHan)]
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors)
    
    //------------------------------------------------------------------------------
    const result2 = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors()
    let matchResult = 'unknow'
    result2.forEach(fd => {
      bestMatch = faceMatcher.findBestMatch(fd.descriptor)
      console.log(bestMatch)
      matchResult=bestMatch.toString()
      return matchResult
    })


    //------------------------------------------------------------------------------
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceExpressions()
    const resizedDetections =  faceapi.resizeResults(detections, displaySize)
    // console.log(resizedDetections)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    

    const results = resizedDetections
    //console.log(results)
    results.forEach((result, i) => {
      const box = resizedDetections[i].detection.box
      const drawBox = new faceapi.draw.DrawBox(box, { label: matchResult })
      drawBox.draw(canvas)
    })
    
    
    //faceapi.draw.drawDetections(canvas, resizedDetections)
    //faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    //faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 1500)
})

// function loadLabeledImages() {

// }