import { useRef, useState } from 'react';

const RECORDING_STATES = {
  INACTIVE: 'inactive',
  RECORDING: 'recording',
  PAUSED: 'paused',
};

const mimeType = 'audio/mp4';
const useMediaRecorder = ({
  mediaStreamConstraints = { audio: true, video: false },
  mediaRecorderOptions = { type: mimeType },
  onStart = () => {},
  onResume = () => {},
  onPause = () => {},
}) => {
  // Refs
  const mediaStream = useRef();
  const mediaRecorder = useRef();
  const mediaChunks = useRef([]);

  // States
  const [mediaBlobUrl, setMediaBlobUrl] = useState();
  const [status, setStatus] = useState(RECORDING_STATES.INACTIVE);

  //#region Event Handlers
  const onStop = () => {
    const mediaBlob = new Blob(mediaChunks.current, mediaRecorderOptions);
    const url = URL.createObjectURL(mediaBlob);
    setMediaBlobUrl(url);
    console.log(`Recording Status: ${status}`);
  };

  const onError = (ev) => {
    console.log(ev.error.name);
  };

  const onDataAvailable = (ev) => {
    if (ev?.data && ev.data.size > 0) {
      mediaChunks.current?.push(ev.data);
    }
  };

  //#endregion

  const getMediaStream = async () => {
    // Get stream from media devices
    try {
      const tmpMediaStream = await navigator.mediaDevices.getUserMedia(
        mediaStreamConstraints
      );
      mediaStream.current = tmpMediaStream;
    } catch (error) {
      console.log(error.message);
    }
  };

  // #region Triggers
  const startRecording = async () => {
    if (!mediaStream.current) {
      await getMediaStream();
    }
    // setup MediaRecorder
    mediaRecorder.current = new MediaRecorder(
      mediaStream.current,
      mediaRecorderOptions
    );

    mediaRecorder.current.onstart = onStart;
    mediaRecorder.current.onPause = onPause;
    mediaRecorder.current.onResume = onResume;
    mediaRecorder.current.onstop = onStop;
    mediaRecorder.current.ondataavailable = onDataAvailable;
    mediaRecorder.current.onError = onError;
    mediaRecorder.current.start();
    setStatus(mediaRecorder?.current?.state);
    console.log(`Recording Status: ${mediaRecorder?.current?.state}`);
  };

  const stopRecording = async () => {
    mediaRecorder?.current?.stop();
    setStatus(mediaRecorder?.current?.state);
    mediaChunks.current = [];
  };

  const resumeRecording = async () => {
    if (mediaRecorder?.current?.state === RECORDING_STATES.PAUSED) {
      mediaRecorder?.current?.resume();
    }
  };

  const pauseRecording = async () => {
    if (mediaRecorder?.current?.state === RECORDING_STATES.RECORDING) {
      mediaRecorder?.current?.resume();
    }
  };

  // #endregion

  return {
    startRecording,
    stopRecording,
    resumeRecording,
    pauseRecording,
    mediaBlobUrl,
    status,
  };
};

export default useMediaRecorder;
