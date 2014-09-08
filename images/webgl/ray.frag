uniform vec2 resolution;
uniform float time;

float _pixelSize = 8.0;

vec4 _background = vec4(1.0, 1.0, 1.0, 1.0);

/*************/
vec2 getPixelCoords(vec2 fragPos)
{
  vec2 pos;
  pos.x = fragPos.x;
  pos.y = fragPos.y;

  pos.x /= _pixelSize;
  pos.y /= _pixelSize;
  pos = floor(pos);

  return pos;
}

/*************/
float sinInteger(float x)
{
  return floor((sin(x) + 1.0) / 2.0 * resolution.y / _pixelSize);
}

/*************/
float drawSinusoid(vec2 position)
{
  vec2 sinProjection = position;
  sinProjection.y = sinInteger(position.x / 8.0);

  //if (length(position - sinProjection) < 2.0)
  if (position.y < sinProjection.y)
    return 1.0;
  else
    return 0.0;
}

/*************/
void main()
{
  vec4 outColor = _background;

  vec2 playerPos;
  playerPos.x = 10.0;
  playerPos.y = (sin(time) + 1.0) / 2.0 * resolution.y / _pixelSize;
  playerPos = floor(playerPos);

  vec2 fragPosition = getPixelCoords(gl_FragCoord.xy);

  if (drawSinusoid(vec2(fragPosition.x + time * 8.0, fragPosition.y)) == 1.0)
    outColor = vec4(0.2, 0.2, 0.2, 1.0);
  else if (drawSinusoid(vec2(fragPosition.x * 2.0 + time * 4.0, fragPosition.y)) == 1.0)
    outColor = vec4(0.4, 0.4, 0.4, 1.0);
  else if (drawSinusoid(vec2(fragPosition.x / 2.0 + time * 2.0, fragPosition.y)) == 1.0)
    outColor = vec4(0.6, 0.6, 0.6, 1.0);
  else if (drawSinusoid(vec2(fragPosition.x + time * 1.0, fragPosition.y)) == 1.0)
    outColor = vec4(0.8, 0.8, 0.8, 1.0);

  //gl_FragColor = vec4(playerPos.x / (resolution.x / _pixelSize), playerPos.y / (resolution.y / _pixelSize), 0.0, 1.0);
  gl_FragColor = outColor;
}
