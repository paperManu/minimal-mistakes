uniform vec2 _resolution;
uniform float _time;

float _pixelSize = 4.0;
float _startupTime = 15.0;
float _enlargeTime = 40.0;
float _noiseTime = 40.0;
float _stopTime = 70.0;

vec4 _background = vec4(1.0, 1.0, 1.0, 1.0);
vec4 _foreground = vec4(1.0, 1.0, 1.0, 1.0);

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
// Noise, from http://www.iquilezles.org/www/articles/voronoise/voronoise.htm
vec3 hash3( vec2 p )
{
    vec3 q = vec3( dot(p,vec2(127.1,311.7)), 
				   dot(p,vec2(269.5,183.3)), 
				   dot(p,vec2(419.2,371.9)) );
	return fract(sin(q)*43758.5453);
}

float noise( in vec2 x, float u, float v )
{
    vec2 p = floor(x);
    vec2 f = fract(x);

    float k = 1.0 + 63.0*pow(1.0-v,4.0);
    float va = 0.0;
    float wt = 0.0;
    for( int j=-2; j<=2; j++ )
    for( int i=-2; i<=2; i++ )
    {
        vec2  g = vec2( float(i), float(j) );
        vec3  o = hash3( p + g )*vec3(u,u,1.0);
        vec2  r = g - f + o.xy;
        float d = dot(r,r);
        float w = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );
        va += w*o.z;
        wt += w;
    }

    return va/wt;
}

/*************/
float sinusoidMoutain(vec2 p, float h, float d)
{
  vec2 sinProjection = p;
  sinProjection.y = sin(p.x) * h + sin(p.x / 3.0) * h / 4.0 + sin(p.x / 5.0) * h / 8.0 + d;

  float maxDistance = 64.0;
  if (distance(sinProjection.y, p.y) < 2.0 && sinProjection.y > p.y) // + startCurve(_time, _enlargeTime) * maxDistance && sinProjection.y > p.y)
    return 1.0;
  else
    return 0.0;
}

/*************/
float getObject(vec2 p)
{
  float resY = _resolution.y / _pixelSize;
  float n = 1.0 - startCurve(_time, _noiseTime) * noise(p.xy / 12.0, 0.6, 0.7);
  vec4 sin1Params = vec4(p.x / 16.0 + _time, p.y, n * resY / 10.0, resY / 5.0);
  vec4 sin2Params = vec4(p.x / 12.0 + _time, p.y, n * resY / 6.0, resY / 5.0 * 2.0);
  vec4 sin3Params = vec4(p.x / 8.0 + _time, p.y, n * resY / 8.0, resY / 5.0 * 3.0);
  vec4 sin4Params = vec4(p.x / 4.0 + _time, p.y, n * resY / 12.0, resY / 5.0 * 4.0);

  float sin1 = _mat1 * sinusoidMoutain(sin1Params.xy, sin1Params.z * startCurve(_time, _startupTime) * (1.0 - startCurve(_time, _stopTime)), sin1Params.w);
  float sin2 = _mat2 * sinusoidMoutain(sin2Params.xy, sin2Params.z * startCurve(_time, _startupTime) * (1.0 - startCurve(_time, _stopTime)), sin2Params.w);
  float sin3 = _mat3 * sinusoidMoutain(sin3Params.xy, sin3Params.z * startCurve(_time, _startupTime) * (1.0 - startCurve(_time, _stopTime)), sin3Params.w);
  float sin4 = _mat4 * sinusoidMoutain(sin4Params.xy, sin4Params.z * startCurve(_time, _startupTime) * (1.0 - startCurve(_time, _stopTime)), sin4Params.w);

  return sin1 == _mat1 ? _mat1 :
         sin2 == _mat2 ? _mat2 :
         sin3 == _mat3 ? _mat3 :
         sin4 == _mat4 ? _mat4 :
         0.0;
}

/*************/
vec4 getColor(float o)
{
  float noiseSize = 1.0;
  vec4 color;
  if (o == 1.0)
  {
    noiseSize = 18.0;
    color = vec4(0.9, 0.9, 0.9, 1.0);
  }
  else if (o == 2.0)
  {
    noiseSize = 14.0;
    color = vec4(0.7, 0.7, 0.7, 1.0);
  }
  else if (o == 3.0)
  {
    noiseSize = 9.0;
    color = vec4(0.4, 0.4, 0.4, 1.0);
  }
  else if (o == 4.0)
  {
    noiseSize = 5.0;
    color = vec4(0.2, 0.2, 0.2, 1.0);
  }
  else
    return _foreground;

  float n = 1.0; // - startCurve(_time, _noiseTime) * 0.5 * noise(vec2(gl_FragCoord.x / _pixelSize / noiseSize + _time, gl_FragCoord.y / _pixelSize / noiseSize), 0.6, 0.7);
  return color * n;
}

/*************/
void main()
{
  vec4 outColor = _foreground;

  vec2 playerPos;
  playerPos.x = 10.0;
  playerPos.y = (sin(_time) + 1.0) / 2.0 * _resolution.y / _pixelSize;
  playerPos = floor(playerPos);

  vec2 fragPosition = getPixelCoords(gl_FragCoord.xy);
  float object = getObject(fragPosition);
  if (object > 0.0)
    outColor = getColor(object);

  float distToBorder = smoothstep(0.0, 32.0, min(gl_FragCoord.y, _resolution.y - gl_FragCoord.y));
  gl_FragColor = mix(_background, outColor, distToBorder);
}
