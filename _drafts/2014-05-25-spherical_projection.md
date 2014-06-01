---
layout: post
title: Spherical projection through GLSL
description: "My take on realtime spherical projection"
modified: 2014-05-25
---

## Spherical projection? In realtime?

When working with a fulldome for realtime 3D projects, one thing is immediately noticeable: this projection surface is not planar. As obvious as it is, it leads to the simple fact that it is not possible for a graphic card to output an image which will not look absurdly deformed once projected. Take a line as a simple example: a straight line becomes a curve when projected on a sphere, so to look straight it has to be deformed before projection and the desired output should be indeed a curve. But a graphic card knows nothing about curves, it can only draw lines, and fill triangles.

Obviously there is a way around this limitation, which is used in every realtime renderers (and in some offline renderers too). The rendering is done in two steps: first a cube map is filled with six renderings for the six directions defined by the cube, then this cube map is applied as a texture on a 3D model representing the mapping of the dome, which is captured and renderer by another camera.

This gives us a minimum of seven render pass (you can do with six if your dome is not that 'full'), which is time and memory consuming. Also it makes the rendering of some visual effects harder, one of them being stereoscopic rendering. This is all the more frustrating as there are work around for offline renderers, which do not have the same graphic card related limitation. Paul Bourke[^1] wrote some interesting articles in this matter.

So, is it possible to create a dome master (that is the name of videos dedicated to fulldome projection) in realtime in a single pass? The answer is kind of a 'yes, but...', which is what makes things interesting.

## First step: changing coordinate system

## Shortest path between two points on Earth

[^1]: [Omni-directional Stereoscopic Fisheye Images for Immersive Hemispherical Dome Environments](http://paulbourke.net/papers/cgat09)
