uniform vec2 _resolution;
uniform float _time;
uniform float _seed;

const float _pixelSize = 3.0;
const vec4 _background = vec4(1.0, 1.0, 1.0, 1.0);
vec3 _position = vec3(0.0, 0.0, -10.0);
vec3 _target = vec3(0.0, 0.0, 0.0);
const float _focal = 12.0;

vec2 _fragResolution = _resolution;
vec2 _fragPosition = vec2(0.0);

const float nPlanets = 8.0;

float _showPlanets = 1.0;

/*************/
float noise(float s)
{
  float q = s * 127.1;
  return fract(sin(q));
}

/*************/
float noise2D(vec2 p, float s)
{
  float q = dot(p,vec2(127.1,311.7));
	return fract(sin(q)*(43758.5453 + s));
}

/***************/
mat4 rtMat(vec3 v, float a)
{
    float c = cos(a);
    float s = sin(a);
    float C = 1.0-c;
    vec3 d = normalize(v);
    float x=d.x, y=d.y, z=d.z;

    mat4 m = mat4(1.0);
    m[0] = vec4(x*x*C+c, y*x*C+z*s, z*x*C-y*s, 0.0);
    m[1] = vec4(x*y*C-z*s, y*y*C+c, z*y*C+x*s, 0.0);
    m[2] = vec4(x*z*C+y*s, y*z*C-x*s, z*z*C+c, 0.0);
    m[3] = vec4(0.0, 0.0, 0.0, 1.0);

    return m;
}

/***************/
mat4 trMat(vec3 v)
{
    mat4 m = mat4(1.0);
    m[3] = vec4(v, 1.0);

    return m;
}

/***************/
float sphere(vec3 p, float r)
{
    return length(p)-r;
}

/***************/
float sdBox(vec3 p, vec3 b)
{
    vec3 d = abs(p)-b;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

/***************/
vec3 getCamera(in vec3 p, in vec3 t, in float f)
{
    // Create a basis from these inputs
    vec3 d = normalize(t-p);
    vec3 x1 = normalize(cross(vec3(0.0, 1.0, 0.0), d));
    vec3 x2 = cross(d, x1); // These should be ortho, no need to normalize

    // Calculate the direction defined by the current fragment
    vec3 pix = vec3(_fragPosition*2.0-1.0, f);
    pix.x *= _resolution.x/_resolution.y;
    pix = normalize(pix.x*x1 + pix.y*x2 + pix.z*d);
    return pix;
}

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
vec2 map(vec3 p)
{
  vec3 pos = p;
  float sun = sphere(pos, 4.0);

  float planet = 1e15;
  if (_showPlanets == 1.0)
  {
    for (float i = 0.0; i < nPlanets; i++)
    {
      if (noise(_seed) > i / nPlanets || i <= 2.0)
      {
        pos = (rtMat(vec3(0.0, 1.0, 0.0), (_time * (0.5 + noise(i) * 0.5)) / 4.0 + i * 4312.0) * vec4(p, 1.0)).xyz;
        pos = (trMat(vec3(10.0 + (i + noise(_seed) * 3.0) * 2.0, 0.0, 0.0)) * vec4(pos, 1.0)).xyz;
        planet = min(sphere(pos, (0.5 + noise(i) * 0.5)), planet);
      }
    }
  }

  vec2 result = vec2(0.0);
  result.x = min(sun, planet);
  if (sun == result.x)
    result.y = 1.0;
  else if (planet == result.x)
    result.y = 2.0;

  return result;
}

/***************/
vec3 getNorm(in vec3 p)
{
    vec2 e = vec2(0.001, 0.0);
    vec3 n;
    n.x = map(p+e.xyy).x - map(p-e.xyy).x;
    n.y = map(p+e.yxy).x - map(p-e.yxy).x;
    n.z = map(p+e.yyx).x - map(p-e.yyx).x;
    return normalize(n);
}

/*************/
vec4 intersect(in vec3 o, in vec3 d, out float dist)
{
  float eps = 0.001;
  dist = 1e+15;

  for (float t = 70.0; t < 130.0; t += 4.0)
  {
    vec2 h = map(o + t*d);
    dist = min(dist, h.x);
    if (dist < 5.0) // Inner loop to improve accuracy
    {
      for (float t2 = 0.0; t2 < 5.0; t2 += 0.2)
      {
        h = map(o + (t + t2)*d);
        if (h.x <= max(1.0, t + t2) * eps)
          return vec4(o + (t + t2)*d, h.y);
      }
    }
  }

  return vec4(0.0);
}

/*************/
vec4 getMaterial(float index)
{
  vec4 m = _background;
  if (index == 1.0)
    m = vec4(0.9, 0.9, 0.7, 1.0);
  else if (index == 2.0)
    m = vec4(0.6, 0.6, 0.7, 1.0);
  else if (index == 10.0)
    m = vec4(0.7, 0.7, 0.7, 1.0);

  return m;
}

/*************/
vec4 getColor(vec4 p, vec3 l, vec3 d)
{
  vec4 c = _background;

  if (p.w != 0.0)
  {
    vec3 norm = getNorm(p.xyz);
    vec4 m = getMaterial(p.w);

    // Lighting
    float i = 1.0;
    if (p.w != 1.0)
    {
      i = max(0.2, -dot(norm, normalize(p.xyz)));

      // Diffraction
      //_showPlanets = 0.0;
      //float dist;
      //vec4 sunPoint = intersect(_position, d, dist);
      //if (sunPoint.w != 0.0)
      //  if (-dot(norm, d) < 1.0)
      //  {
      //    //m = mix(m, getMaterial(1.0), 1.0 - dot(norm, d));
      //    vec3 sunNorm = getNorm(_position.xyz);
      //    i = (0.5 - dot(sunNorm, d) * 0.5) * (1.0 + dot(norm, d));
      //  }
      //_showPlanets = 1.0;
    }
    else
      i = 0.8 - dot(norm, d) * 0.2;


    c = m*i;
  }
  else // Draw some other space bodies
  {
    float r = noise2D(_fragPosition, _seed);
    if (r > 0.99)
    {
      c = getMaterial(10.0);
      float i = noise2D(_fragPosition, _seed);
      c = c*i;
    }
  }

  return c;
}

/*************/
void main()
{
  vec4 color = _background;

  _position = normalize(vec3(4.0, 1.0, -8.0)) * 100.0;
  _target = vec3(cos(_time / 2.34) * 0.2, -2.0 + sin(_time) * 0.2, 0.0);

  _fragResolution = _resolution.xy; //getPixelCoords(_resolution.xy);
  _fragPosition = vec2(getPixelCoords(gl_FragCoord.xy).x * _pixelSize / _resolution.x,
                       getPixelCoords(gl_FragCoord.xy).y * _pixelSize / _resolution.y); //getPixelCoords(gl_FragCoord.xy);

  vec3 light = normalize(vec3(-1.0, -2.0, 1.0));
  vec3 dir = getCamera(_position, _target, _focal);

  float dist;
  vec4 point = intersect(_position, dir, dist);

  color = getColor(point, light, dir);

  float distToBorder = smoothstep(0.0, 32.0, min(gl_FragCoord.y, _resolution.y - gl_FragCoord.y));
  gl_FragColor = mix(_background, color, distToBorder);
}
