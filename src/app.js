import React, { Component } from "react";
import ClassNames from "classnames";
import PropTypes from "prop-types";
import Animator from "jw-animator";
import AnimateCanvas from "jw-animate-canvas";
import CanvasASCII from "jw-canvas-ascii";
import ColorPicker from "jw-color-picker";

import InputField from "./inputfield";
import Rain from "./rain";

import demoSource from "./resources/demo.mp4";
import play from "./resources/play.png";
import pause from "./resources/pause.png";
import camera from "./resources/camera.png";
import movie from "./resources/movie.png";
import copy from "./resources/copy.png";

import "./app.css";

const { max } = Math;

class App extends Component {
  constructor(props) {
    super(props);

    const { animator } = props;

    animator.setPauseOnHidden(true);
    animator.setResumeOnShown(true);

    this.state = {
      loading: true,
      show: false,
      paused: false,
      onCamera: false,
      color: { r: 0, g: 128, b: 0, a: 1 },
      fontSize: 7
    };

    this.rain = new Rain();

    this.animate = this.animate.bind(this);
    this.screenClickHandler = this.screenClickHandler.bind(this);
    this.playClickHandler = this.playClickHandler.bind(this);
    this.cameraClickHandler = this.cameraClickHandler.bind(this);
    this.copyClickHandler = this.copyClickHandler.bind(this);
    this.draw = this.draw.bind(this);
  }

  componentDidMount() {
    const { video, ascii, canvas, props } = this;
    const { animator } = props;

    animator.onStart(() => video.play());
    animator.onPause(() => video.pause());
    animator.onResume(() => video.play());

    ascii.setCanvas(canvas.canvas);

    video.src = demoSource;

    animator.start();
  }

  screenClickHandler() {
    const { show } = this.state;
    this.setState({ show: !show });
  }

  playClickHandler() {
    const { animator } = this.props;
    const { paused } = this.state;

    if (paused) {
      animator.resume();
    } else {
      animator.pause();
    }

    this.setState({ paused: !paused });
  }

  async cameraClickHandler() {
    const { video } = this;
    const { animator } = this.props;
    const { onCamera } = this.state;

    animator.pause();

    if (onCamera) {
      video.srcObject = undefined;
      video.src = demoSource;
      this.setState({ onCamera: false });
    } else {
      try {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true });

        if (stream) {
          video.srcObject = stream;
          video.src = undefined;
          this.setState({ onCamera: true });
        }
      } catch (error) {}
    }

    animator.resume();
  }

  copyClickHandler() {
    const { ascii } = this;
    const asciiElement = ascii.getTextElement();
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(asciiElement);
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand("Copy");

    selection.removeAllRanges();
  }

  draw() {
    const { rain, video, canvas, ascii } = this;
    const context = canvas.getContext();
    const { width, height } = canvas.getCanvasElement();

    /* Clear the canvas screen. */
    context.clearRect(0, 0, width, height);

    /* Paint the video onto the canvas. */
    context.drawImage(video, 0, 0, width, height);

    rain.draw(context, width, height, ascii.textWidth);

    /* Update the acsii code from the canvas. */
    ascii.update(canvas.getCanvasElement());
  }

  animate(context, width, height, timeDiff) {
    const { rain } = this;

    rain.update(timeDiff);
    this.draw();
  }

  render() {
    const { animator } = this.props;
    const { loading, show, paused, onCamera, color, fontSize } = this.state;
    const { r, g, b, a } = color;

    return (
      <div id="matrix-scene">
        <video
          ref={v => (this.video = v)}
          className="matrix-video"
          preload="auto"
          autoPlay={true}
          loop={true}
          muted={true}
          controls={true}
          onCanPlay={() => this.setState({ loading: false })}
        />
        <AnimateCanvas
          ref={c => (this.canvas = c)}
          className="matrix-canvas"
          animator={animator}
          animate={this.animate}
          onResize={this.draw}
        />
        <CanvasASCII
          ref={a => (this.ascii = a)}
          className="matrix-ascii"
          style={{
            color: `rgba(${r}, ${g}, ${b}, ${a})`,
            fontSize: `${parseInt(fontSize, 10)}px`
          }}
          invert={true}
          onClick={this.screenClickHandler}
        />
        <button
          className={ClassNames("matrix-play-button", { paused, show })}
          style={{ backgroundImage: `url(${paused ? play : pause})` }}
          onClick={this.playClickHandler}
        />
        <button
          className={ClassNames("matrix-camera-button", { show })}
          style={{ backgroundImage: `url(${onCamera ? movie : camera})` }}
          onClick={this.cameraClickHandler}
        />
        <button
          className={ClassNames("matrix-copy-button", { show })}
          style={{ backgroundImage: `url(${copy})` }}
          onClick={this.copyClickHandler}
        />
        <div className={ClassNames("matrix-color", { show })}>
          <label htmlFor="color">color</label>
          <ColorPicker
            id="color"
            className="matrix-color-picker"
            color={color}
            onChange={value => this.setState({ color: value })}
          />
        </div>
        <InputField
          id="fontSize"
          className={ClassNames("matrix-font-size", { show })}
          label="font size"
          value={fontSize}
          onChange={value =>
            this.setState({ fontSize: max(2, value) }, this.draw)
          }
        />
        <div className={ClassNames("loading-overlay", { show: loading })}>
          <pre style={{ color: `rgba(${r}, ${g}, ${b}, ${a})` }}>Loading</pre>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  animator: PropTypes.instanceOf(Animator)
};

App.defaultProps = {
  animator: new Animator()
};

export default App;
