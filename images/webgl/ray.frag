uniform vec2 resolution;
uniform float time;

float _pixelSize = 4.0;
float _startupLength = 15.0;

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
float diffraction(float x)
{
  return smoothstep(0.0, 1.0, x);
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
  else
    return 3.0 * pow(x / _startupLength, 2.0) - 2.0 * pow(x / _startupLength, 2.0);
}

/*************/
float sinusoidMoutain(vec2 p, float h, float d)
{
  vec2 sinProjection = p;
  sinProjection.y = floor(sin(p.x) * h + sin(p.x / 2.0) * h / 4.0 + sin(p.x / 4.0) * h / 8.0 + d);

  float maxDistance = 4.0;
  //if (distance(sinProjection.y, p.y) > positiveSin(time) * maxDistance)
    return distance(sinProjection.y, p.y) / (positiveSin(time) * maxDistance);
  //else
    //return 0.0;
}

/*************/
float getObject(vec2 p)
{
  float resY = resolution.y / _pixelSize;
  vec4 sin1Params = vec4(p.x / 8.0 + time, p.y, resY / 2.0, resY / 5.0);
  vec4 sin2Params = vec4(p.x / 16.0 + time, p.y, resY / 3.0, resY / 3.0);
  vec4 sin3Params = vec4(p.x / 4.0 + time, p.y, resY / 4.0, resY / 1.5);
  vec4 sin4Params = vec4(p.x / 12.0 + time, p.y, resY / 2.5, resY / 2.0);

  float sin1 = _mat1 * smoothstep(0.0, 1.0, 1.0 - sinusoidMoutain(sin1Params.xy, sin1Params.z * startCurve(time, _startupLength), sin1Params.w));
  float sin2 = _mat2 * smoothstep(0.0, 1.0, 1.0 - sinusoidMoutain(sin2Params.xy, sin2Params.z * startCurve(time, _startupLength), sin2Params.w));
  float sin3 = _mat3 * smoothstep(0.0, 1.0, 1.0 - sinusoidMoutain(sin3Params.xy, sin3Params.z * startCurve(time, _startupLength), sin3Params.w));
  float sin4 = _mat4 * smoothstep(0.0, 1.0, 1.0 - sinusoidMoutain(sin4Params.xy, sin4Params.z * startCurve(time, _startupLength), sin4Params.w));

  return max(sin1, max(sin2, max(sin3, sin4)));
}

/*************/
vec4 getColor(float o)
{
  if (o <= 1.0 && o > 0.0)
    return vec4(0.8, 0.8, 0.8, 1.0) * o;
  else if (o <= 2.0)
    return vec4(0.6, 0.6, 0.6, 1.0) * (1.0 - o);
  else if (o <= 3.0)
    return vec4(0.4, 0.4, 0.4, 1.0) * (2.0 - o);
  else if (o <= 4.0)
    return vec4(0.2, 0.2, 0.2, 1.0) * (3.0 - o);
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
