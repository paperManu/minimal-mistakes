uniform vec2 resolution;
uniform float time;

float _pixelSize = 8.0;

vec4 _background = vec4(1.0, 1.0, 1.0, 1.0);
vec4 _foreground = vec4(0.0, 0.0, 0.0, 1.0);

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
float diffraction(float x)
{
  return smoothstep(0.0, 1.0, x);
}

/*************/
float sinInteger(float x)
{
  return floor((sin(x) + 1.0) / 2.0 * resolution.y / _pixelSize);
}

/*************/
float sinusoidMoutain(vec2 p, float h, float d)
{
  vec2 sinProjection = p;
  sinProjection.y = sinInteger(p.x) * h + sinInteger(p.x / 2.0) * h / 4.0 + sinInteger(p.x / 4.0) * h / 8.0 + d;

  if (sinProjection.y < p.y)
    return length(p - sinProjection);
  else
    return 0.0;
}

/*************/
float getObject(vec2 p)
{
  float moutain1 = 1.0 * step(0.5, 1.0 - sinusoidMoutain(vec2(p.x / 8.0 + time, p.y), 0.7, 8.0));
  float moutain2 = 2.0 * step(0.5, 1.0 - sinusoidMoutain(vec2(p.x / 16.0 + time, p.y), 0.6, 4.0));
  float moutain3 = 3.0 * step(0.5, 1.0 - sinusoidMoutain(vec2(p.x / 13.0 + time * 2.0, p.y), 0.3, 2.0));
  float moutain4 = 4.0 * step(0.5, 1.0 - sinusoidMoutain(vec2(p.x / 9.0 + time * 4.0, p.y), 0.1, 1.0));

  return max(moutain1, max(moutain2, max(moutain3, moutain4)));
}

/*************/
vec4 getColor(float o)
{
  if (o == 1.0)
    return vec4(0.8, 0.8, 0.8, 1.0);
  else if (o == 2.0)
    return vec4(0.6, 0.6, 0.6, 1.0);
  else if (o == 3.0)
    return vec4(0.4, 0.4, 0.4, 1.0);
  else if (o == 4.0)
    return vec4(0.2, 0.2, 0.2, 1.0);
  else
    return _foreground;
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
  float object = getObject(fragPosition);
  if (object > 0.0)
    outColor = getColor(object);

  float distToBorder = smoothstep(0.0, 16.0, min(gl_FragCoord.y, resolution.y - gl_FragCoord.y));
  gl_FragColor = mix(_background, outColor, distToBorder);
}
