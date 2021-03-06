import React, { Component } from 'react';
import Pane from './components/pane/pane';
import Logo from './components/logo/logo';
import SearchBox from './components/searchbox/searchbox';
import ImageRecog from './components/imagerecog/imagerecog';
import SignIn from './components/signin/signin';
import Register from './components/register/register';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import './App.css';

const obj={
      particles: {
        number:{
          value:300,
          density: {
            enable: true,
            value_are:800
          }
        }
      }};

const app = new Clarifai.App({
 apiKey: '5f32cefbdcc0413594da51b2aa3bce41'
});

class App extends Component {

  constructor()
  {
    super();
    this.state={
      input:'',
      imageUrl:'' ,
      faceBox:'',
      route:'signin',
      user:{
        name:'',
        email:'',
        id:'',
        entries:0,
        time:'',
      }
    };
  }

  changeState=(str)=>{
      this.setState({imageUrl:''});
    this.setState({route:str});
  }

  findFaceLoc=(obj)=>{
    const faceArray=obj.outputs[0].data.regions[0].region_info.bounding_box;
    const img=document.getElementById("inputImage");
    const width=Number(img.width);
    const height=Number(img.height);
    const box={
      topRow:height*faceArray.top_row,
      leftCol:width*faceArray.left_col,
      bottomRow:height-(height*faceArray.bottom_row),
      rightCol:width-(width*faceArray.right_col),
    }

    this.setState({faceBox:box})
  }

  onChangeFunc=(event)=>{
    this.setState({input:event.target.value});
  }

 onClickFunc=()=>{
    this.setState({imageUrl:this.state.input});

    app.models.predict(Clarifai.FACE_DETECT_MODEL,this.state.input)
    .then((response)=>{
      this.findFaceLoc(response);

      fetch('http://localhost:3006/images',{
        method:'put',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          id:this.state.user.id,
        })
      })
      .then(response=>response.json())
      .then((data)=>{
        if(data!=='failure'){
        this.setState(Object.assign(this.state.user,{entries:data.entries}));
        }
        else {

          console.log("error entries");
        }
      })
      .catch(console.log);
    })
    .catch(err=>console.log(err));
  }


  loadProfile=(data)=>{
    this.setState(Object.assign(this.state.user,{
      name:data.name,
      email:data.email,
      id:data.id,
      entries:data.entries,
      time:data.time,
    }));
  }

  render() {
    return (
      <div >
        <Particles  params={obj} className="particlebg" />
        <Pane active={this.state.route} changeState={this.changeState}/>
        <Logo/>

        {
          (this.state.route==='home')?
            <div>
              <div className="center heading1">
                <p>{this.state.user.name+" your rank is ....."}</p>
              </div>
              <div className="center heading1">
                <p>{"#" + this.state.user.entries}</p>
              </div>
              <div className="center heading2">
                <p>This magic brain will detect faces in your image</p>
              </div>
              <SearchBox onClickFunc={this.onClickFunc} onChangeFunc={this.onChangeFunc}/>
              <div className="ma4">
                <ImageRecog imageUrl={this.state.imageUrl} faceBox={this.state.faceBox}/>
              </div>
            </div>
          :
          (
            (this.state.route==='signin')?
              <div>
                  <SignIn  changeState={this.changeState} loadProfile={this.loadProfile}/>
              </div>
            :
              <div>
                  <Register changeState={this.changeState}/>
              </div>

          )

        }

      </div>

    );
  }
}

export default App;
