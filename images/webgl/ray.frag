uniform vec2 resolution;
uniform float time;

float _pixelSize = 4.0;
float _startupTime = 15.0;
float _enlargeTime = 30.0;
float _stopTime = 45.0;

vec4 _background = vec4(1.0, 1.0, 1.0, 1.0);
vec4 _foreground = vec4(0.0, 0.0, 0.0, 1.0);

float _mat1 = 1.0;
float _mat2 = 2.0;
float _mat3 = 3.0;
float _mat4 = 4.0;

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
float positiveSin(float x)
{
  return (sin(x) + 1.0) / 2.0;
}

/*************/
float startCurve(float x, float l)
{
  if (x > l)
    return 1.0;
  else if (x < l / 2.0)
    return 0.0;
  else
    return 3.0 * pow((x-l/2.0) / (l/2.0), 2.0) - 2.0 * pow((x-l/2.0) / (l/2.0), 2.0);
}

/*************/
float sinusoidMoutain(vec2 p, float h, float d)
{
  vec2 sinProjection = p;
  sinProjection.y = sin(p.x) * h + sin(p.x / 2.0) * h / 4.0 + sin(p.x / 4.0) * h / 8.0 + d;

  float maxDistance = 64.0;
  if (distance(sinProjection.y, p.y) < 1.0 + startCurve(time, _enlargeTime) * maxDistance && sinProjection.y > p.y)
    return 1.0;
  else
    return 0.0;
}

/*************/
float getObject(vec2 p)
{
  float resY = resolution.y / _pixelSize;
  vec4 sin1Params = vec4(p.x / 16.0 + time, p.y, resY / 10.0, resY / 5.0);
  vec4 sin2Params = vec4(p.x / 12.0 + time, p.y, resY / 6.0, resY / 5.0 * 2.0);
  vec4 sin3Params = vec4(p.x / 8.0 + time, p.y, resY / 8.0, resY / 5.0 * 3.0);
  vec4 sin4Params = vec4(p.x / 4.0 + time, p.y, resY / 5.0, resY / 5.0 * 4.0);

  float sin1 = _mat1 * sinusoidMoutain(sin1Params.xy, sin1Params.z * startCurve(time, _startupTime) * (1.0 - startCurve(time, _stopTime)), sin1Params.w);
  float sin2 = _mat2 * sinusoidMoutain(sin2Params.xy, sin2Params.z * startCurve(time, _startupTime) * (1.0 - startCurve(time, _stopTime)), sin2Params.w);
  float sin3 = _mat3 * sinusoidMoutain(sin3Params.xy, sin3Params.z * startCurve(time, _startupTime) * (1.0 - startCurve(time, _stopTime)), sin3Params.w);
  float sin4 = _mat4 * sinusoidMoutain(sin4Params.xy, sin4Params.z * startCurve(time, _startupTime) * (1.0 - startCurve(time, _stopTime)), sin4Params.w);

  return sin1 == _mat1 ? _mat1 :
         sin2 == _mat2 ? _mat2 :
         sin3 == _mat3 ? _mat3 :
         sin4 == _mat4 ? _mat4 :
         0.0;
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
  vec4 outColor = _foreground;

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
