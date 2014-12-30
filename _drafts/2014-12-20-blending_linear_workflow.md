---
layout: post
title: Videoprojection blending and linear workflow
description: "Some insights regarding projection blending using OpenGL"
modified: 2014-12-20
image:
    feature: spherical_glsl/feature.png
---

## Merging videoprojection
While videoprojection using a single projector can be fine without much tuning of its brightness and colors, many issues arise when multiple projectors are involved. Of those, the first is to manage creating the illusion of a single protection and dissipate the perception of the multiple projection areas. This is the goal of videoprojection blending: to ensure a seamless transition between projection areas.

Among the many parameters to manage to create such a blending, we can name the obvious brightness and color balance of the videoprojectors. These parameters are a combination of hardware and software properties, and their respective calibration and correction has been covered in the literature[^1] [^2]. An area which has not really been covered yet is how to implement these corrections in a computer graphics pipeline, and most precisely an OpenGL pipeline from the video source to the image fed to the projector.

## Theoretical (non-linear) projectors
Before all, we will start with a few asumptions regarding the properties of a real, common videoprojector. As we want to focus on the pipeline which creates the final projected image, we will consider that the projectors are perfect: no deformation, uniform brightness across the projection area, and with a very standard sRGB color space. Also, the mapping is assumed to be perfect, with a 1 to 1 correspondance between the pixels from both videoprojectors

A common way to deal with blending is to apply a S-shaped curve to the intensity of the two projectors in the overlapping area, so that the combination of both projections creates the desired final value. A simple implementation of such a correction would imply a fullscreen quad with a RGBA texture applied on it, through the following fragment shader, on each projector:

{% highlight glsl linenos %}
#version 330 core

#define SIDE 0 // 0 for left projector, 1 for right
#define BLENDSIZE 0.1 // blending size of 10% of the output size

uniform sampler2D tex;
in VertexData
{
    vec4 position;
    vec2 texCoord;
} vertexIn;

out fragColor;

/*************/
void main(void)
{
    vec4 color = texture(tex, vertexIn.texCoord);
    if (SIDE == 0)
        fragColor.rgb = color.rgb * (1.0 - smoothstep(1.0 - BLENDSIZE, 1.0, vertexIn.texCoord));
    else if (SIDE == 1 && vertexIn.texCoord <= BLENDSIZE)
        fragColor.rgb = color.rgb * smoothstep(0.0, BLENDSIZE, vertexIn.texCoord);
    fragColor.a = 1.0;
}

{% endhighlight %}

An illustration of the resulting projection is shown on the left side of this post's banner. And it is not nearly seamless, and the main reason to this fact holds in one word (sort of): sRGB.

## Linear workflow to the rescue

## Next on the list...

[^1]: Brandon B. May, Nathan D. Cahill., Mitchell R. Rosen, "Calibration of a Multi-Projector System for Display on a Cylindrical Surface", 2010 WNYIPW.
[^2]: Bruce Lindbloom [website](http://www.brucelindbloom.com)
