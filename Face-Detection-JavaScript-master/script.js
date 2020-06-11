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

  // const img =  await  faceapi.fetchImage('https://upload.wikimedia.org/wikipedia/commons/6/6a/%E9%AB%98%E9%9B%84%E5%B8%82%E9%95%B7_%E9%9F%93%E5%9C%8B%E7%91%9C.jpg')
  const img =  await  faceapi.fetchImage('https://scontent.ftpe8-4.fna.fbcdn.net/v/t1.0-9/19113552_1989635447924842_1471858016262270892_n.jpg?_nc_cat=102&_nc_sid=09cbfe&_nc_ohc=qUpL8_s2yGUAX_oxS9n&_nc_ht=scontent.ftpe8-4.fna&oh=20ed7b6b5a4381eb138a4418ac086950&oe=5F05B092')


 
 
  const Descriptors =  await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()
  const descriptorsHan = [new Float32Array(Descriptors[0].descriptor)]
  const labeledDescriptors = [new faceapi.LabeledFaceDescriptors('李奕勳', descriptorsHan)]
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.53)

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
  }, 250)
})
