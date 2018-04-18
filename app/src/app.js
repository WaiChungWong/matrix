import React, { Component } from "react";
import ClassNames from "classnames";
import PropTypes from "prop-types";
import Animator from "@jworkshop/animator";
import CanvasAnimator from "@jworkshop/canvasanimator";
import CanvasAsciifier from "@jworkshop/canvasasciifier";
import ColorPicker from "@jworkshop/colorpicker";
import getUserMedia from "getusermedia";

import InputField from "./inputfield";
import Rain from "./rain";

import demoSource from "./resources/demo.ogv";
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

    animator.pauseOnHidden = true;
    animator.resumeOnShown = true;

    this.state = {
      showMenu: false,
      paused: false,
      onCamera: false,
      color: { r: 0, g: 128, b: 0, a: 1 },
      fontSize: 7,
      lineHeight: 7,
      source: demoSource
    };

    this.rain = new Rain();
  }

  componentDidMount() {
    const { canvas } = this;

    canvas.start();
  }

  pauseHandler() {
    this.video.pause();
  }

  resumeHandler() {
    this.video.play();
  }

  screenClickHandler() {
    const { showMenu } = this.state;
    this.setState({ showMenu: !showMenu });
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

  cameraClickHandler() {
    const { onCamera } = this.state;

    if (onCamera) {
      this.setState({ onCamera: false, source: demoSource });
    } else {
      getUserMedia((error, stream) => {
        if (stream) {
          this.setState({
            onCamera: true,
            source: window.URL.createObjectURL(stream)
          });
        }
      });
    }
  }

  copyClickHandler() {
    const { asciifier } = this;
    const asciiElement = asciifier.getTextElement();
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(asciiElement);
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand("Copy");
  }

  draw() {
    const { rain, video, canvas, asciifier } = this;
    const context = canvas.getContext();
    const width = canvas.getCanvasWidth();
    const height = canvas.getCanvasHeight();

    /* Clear the canvas screen. */
    context.clearRect(0, 0, width, height);

    /* Paint the video onto the canvas. */
    context.drawImage(video, 0, 0, width, height);

    rain.draw(context, width, height, asciifier.textWidth);

    /* Update the acsii code from the canvas. */
    asciifier.update(canvas.getCanvasElement());
  }

  animate(context, width, height, timeDiff) {
    const { rain } = this;

    rain.update(timeDiff);
    this.draw();
  }

  render() {
    const { animator } = this.props;
    const {
      showMenu: show,
      paused,
      onCamera,
      color,
      fontSize,
      lineHeight,
      source
    } = this.state;
    const { r, g, b, a } = color;

    return (
      <div id="matrix-scene">
        <video
          ref={video => (this.video = video)}
          className="matrix-video"
          src={source}
          autoPlay={true}
          loop={true}
          muted={true}
        />
        <CanvasAnimator
          ref={canvas => (this.canvas = canvas)}
          className="matrix-canvas"
          animator={animator}
          animate={(context, width, height, timeDiff) =>
            this.animate(context, width, height, timeDiff)
          }
          onResize={() => this.draw()}
          onPause={() => this.pauseHandler()}
          onResume={() => this.resumeHandler()}
        />
        <CanvasAsciifier
          ref={asciifier => (this.asciifier = asciifier)}
          className="matrix-ascii"
          textClassName="matrix-ascii-text"
          textStyle={{
            color: `rgba(${r}, ${g}, ${b}, ${a})`,
            fontSize: `${parseInt(fontSize, 10)}px`,
            lineHeight: `${parseInt(lineHeight, 10)}px`
          }}
          invert={true}
          onClick={() => this.screenClickHandler()}
        />
        <button
          className={ClassNames("matrix-play-button", { paused, show })}
          style={{ backgroundImage: `url(${paused ? play : pause})` }}
          onClick={() => this.playClickHandler()}
        />
        <button
          className={ClassNames("matrix-camera-button", { show })}
          style={{ backgroundImage: `url(${onCamera ? movie : camera})` }}
          onClick={() => this.cameraClickHandler()}
        />
        <button
          className={ClassNames("matrix-copy-button", { show })}
          style={{ backgroundImage: `url(${copy})` }}
          onClick={() => this.copyClickHandler()}
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
            this.setState({ fontSize: max(2, value) }, () => this.draw())
          }
        />
        <InputField
          id="lineHeight"
          className={ClassNames("matrix-line-height", { show })}
          label="line height"
          value={lineHeight}
          onChange={value =>
            this.setState({ lineHeight: max(2, value) }, () => this.draw())
          }
        />
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
