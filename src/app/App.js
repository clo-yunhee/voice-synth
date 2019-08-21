import React from 'react';
import Masonry from 'react-masonry-component';
import PerfectScrollbar from 'react-perfect-scrollbar';
import './App.css';
import VoiceSynth from '../synth/VoiceSynth';
import Navbar from '../components/Navbar';
import PresetSelector from '../components/PresetSelector'
import GlottalSource from "../components/GlottalSource"
import VocalTract from '../components/VocalTract'
import Footer from "../components/Footer";
import makeControl from "../controller/make";
import AppContext from './AppContext'
import {defaultPreset} from "../presets";

class App extends React.PureComponent {

  constructor(props) {
    super(props);
    this.synth = new VoiceSynth();
    this.controller = makeControl(this.synth);

    this.synth.loadModules().then(() => {
      this.controller.onPreset(defaultPreset, true);
    });
  }

  render() {
    return (
        <AppContext.Provider value={this.controller}>
          <div className="App">
            <Navbar/>
            <div className="App-wrapper">
              <PerfectScrollbar className="App-scroller">
                <PresetSelector/>
                <Masonry className="App-container"
                         options={{itemSelector: '.App-element', columnWidth: 1, horizontalOrder: true}}>
                  <GlottalSource/>
                  <VocalTract/>
                </Masonry>
              </PerfectScrollbar>
            </div>
            <Footer/>
          </div>
        </AppContext.Provider>
    );
  }
}

export default App;