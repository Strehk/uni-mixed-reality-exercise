// Copyright 2018 The Immersive Web Community Group
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/*
Node for displaying 2D or stereo videos on a quad.
*/

import { Material } from '../core/material.js'
import { Primitive, PrimitiveAttribute } from '../core/primitive.js'
import { Node } from '../core/node.js'
import { VideoTexture } from '../core/texture.js'
import { ButtonNode } from './button-node.js'

const GL = WebGLRenderingContext; // For enums

class VideoMaterial extends Material {
  constructor() {
    super();

    this.image = this.defineSampler("diffuse");

    this.tex_coord_scale_offset = this.defineUniform("texCoordScaleOffset",
                                                      [1.0, 1.0, 0.0, 0.0,
                                                       1.0, 1.0, 0.0, 0.0], 4);
  }

  get material_name() {
    return 'VIDEO_PLAYER';
  }

  get vertex_source() {
    return `
    uniform int EYE_INDEX;
    uniform vec4 texCoordScaleOffset[2];
    attribute vec3 POSITION;
    attribute vec2 TEXCOORD_0;
    varying vec2 vTexCoord;

    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {
      vec4 scaleOffset = texCoordScaleOffset[EYE_INDEX];
      vTexCoord = (TEXCOORD_0 * scaleOffset.xy) + scaleOffset.zw;
      vec4 out_vec = proj * view * model * vec4(POSITION, 1.0);
      return out_vec;
    }`;
  }

  get fragment_source() {
    return `
    uniform sampler2D diffuse;
    varying vec2 vTexCoord;

    vec4 fragment_main() {
      return texture2D(diffuse, vTexCoord);
    }`;
  }
}

export class VideoNode extends Node {
  constructor(options) {
    super();

    this._video = options.video;
    this._display_mode = options.display_mode || "mono";

    this._video_texture = new VideoTexture(this._video);
  }

  onRendererChanged(renderer) {
    let vertices = [
      -1.0,  1.0, 0.0,  0.0, 0.0,
       1.0,  1.0, 0.0,  1.0, 0.0,
       1.0, -1.0, 0.0,  1.0, 1.0,
      -1.0, -1.0, 0.0,  0.0, 1.0,
    ];
    let indices = [
      0, 2, 1,
      0, 3, 2
    ];

    let vertex_buffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices));
    let index_buffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));

    let attribs = [
      new PrimitiveAttribute("POSITION", vertex_buffer, 3, GL.FLOAT, 20, 0),
      new PrimitiveAttribute("TEXCOORD_0", vertex_buffer, 2, GL.FLOAT, 20, 12),
    ];
  
    let primitive = new Primitive(attribs, indices.length);
    primitive.setIndexBuffer(index_buffer);
    primitive.setBounds([-1.0, -1.0, 0.0], [1.0, 1.0, 0.015]);

    let material = new VideoMaterial();
    material.image.texture = this._video_texture;

    switch(this._display_mode) {
      case "mono":
        material.tex_coord_scale_offset.value = [1.0, 1.0, 0.0, 0.0,
                                                 1.0, 1.0, 0.0, 0.0];
        break;
      case "stereoTopBottom":
        material.tex_coord_scale_offset.value = [1.0, 0.5, 0.0, 0.0,
                                                 1.0, 0.5, 0.0, 0.5];
        break;
      case "stereoLeftRight":
        material.tex_coord_scale_offset.value = [0.5, 1.0, 0.0, 0.0,
                                                 0.5, 1.0, 0.5, 0.0];
        break;
    }

    let render_primitive = renderer.createRenderPrimitive(primitive, material);
    this.addRenderPrimitive(render_primitive);
  }
}