#define MIN_RAY_STEP 0.05

uniform vec2 _resolution;
uniform float _time;
uniform float _seed;

const float _pixelSize = 1.0;
const vec4 _background = vec4(1.0, 1.0, 1.0, 1.0);
vec3 _position = vec3(0.0, 0.0, -10.0);
vec3 _target = vec3(0.0, 0.0, 0.0);
const float _focal = 12.0;

vec2 _fragPosition = vec2(0.0);

const float nPlanets = 8.0;

float _showPlanets = 1.0;
float _showSun = 1.0;

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

/*************/
float noise3D(vec3 p, float s)
{
  float q = dot(p,vec3(127.1,311.7,269.5));
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
  return floor(fragPos / _pixelSize);
}

/*************/
vec2 map(vec3 p)
{
  vec3 pos = p;
  float sun = 1e15;

  if (_showSun == 1.0)
    sun = sphere(pos, 6.0);

  float planet = 1e15;
  if (_showPlanets == 1.0)
  {
    for (float i = 0.0; i < nPlanets; i++)
    //for (float i = 0.0; i < 1.0; i++)
    {
      if (_seed > i / nPlanets || i <= 2.0)
      {
        float n = 0.5 + noise(i) * 0.5;
        pos = (rtMat(vec3(0.0, 1.0, 0.4 * noise(i)), (_time * n) / 8.0 + i * 4312.0) * vec4(p, 1.0)).xyz;
        //pos = (rtMat(vec3(0.0, 1.0, 0.5), 2.16 + i * 4312.0) * vec4(p, 1.0)).xyz;
        pos = (trMat(vec3(10.0 + (i + noise(_seed) * 3.0) * 2.0, 0.0, 0.0)) * vec4(pos, 1.0)).xyz;
        //pos = (trMat(vec3(15.0, 0.0, 0.0)) * vec4(pos, 1.0)).xyz;
        planet = min(sphere(pos, n), planet);
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
  float gravityDist = 0.7;
  dist = 1e+15;

  vec3 dir = d;
  vec3 lastPos = o;

  float lastStep = 0.0;
  float diff = 0.0;
  for (float t = 0.0; t < 140.0; t += MIN_RAY_STEP)
  {
    if (diff < MIN_RAY_STEP)
    {
      float delta = t - lastStep;
      vec3 newPos = lastPos + delta*dir;

      vec2 h = map(newPos);
      dist = min(dist, h.x);

      if (h.x <= max(1.0, t) * eps)
        return vec4(newPos, h.y);
      else if (h.x <= gravityDist && h.y != 1.0) // disable gravity for the sun, keep it smooth on old gpu
      {
        vec3 norm = getNorm(newPos);
        dir -= norm * pow((1.0 - h.x / gravityDist), 2.0) * lastStep * 0.001;
        dir = normalize(dir);
      }

      diff = h.x;
      lastPos = newPos;
      lastStep = t;
    }
    else
      diff -= MIN_RAY_STEP;
  }

  return vec4(0.0);
}

/*************/
float sss(vec3 p, vec3 n, float d)
{
  float o = 0.0;
  for (float j = 8.0; j > 0.0; j--)
    o += (j*d + abs(map(p + n*j*d).x)) / exp2(j);
  return 1.0 - o;
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
    m = vec4(0.9, 0.9, 0.9, 1.0);

  return m;
}

/*************/
vec4 getColor(vec4 p, vec3 d)
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
      //float sss = sss(p.xyz, d, 0.05);
      //i *= sss;
    }
    else
    {
      float angle = -dot(norm, d);
      if (angle < 0.5)
      {
        _showSun = 0.0;
        vec4 point = intersect(_position, d, i); // we are using i here as it is not useful anymore
        if (point.w == 2.0 && length(point) > length(p))
          m = m * getMaterial(point.w);
        i = 1.0;
        _showSun = 1.0;
      }
      else
        i = 0.8 - dot(norm, d) * 0.2;
    }


    c = m*i;
  }
  else // Draw some other space bodies
  {
    float r = noise2D(_fragPosition, _seed);
    float galaxyView = 0.05 * pow(sin((-0.2 + _fragPosition.y + 0.3 * _fragPosition.x) * 3.1415), 8.0);
    if (r < galaxyView)
    {
      c = getMaterial(10.0);
      float i = noise2D(_fragPosition, _seed) * 0.3 + 0.7;
      c = c*i;
    }
  }

  return c;
}

/*************/
void main()
{
  vec4 color = _background;

  _position = normalize(vec3(4.0, 3.0, -8.0)) * 90.0;
  _target = vec3(cos(_time / 2.34) * 0.2, -0.5 + sin(_time) * 0.2, 0.0);

  _fragPosition = gl_FragCoord.xy * _pixelSize / _resolution.xy;

  vec3 dir = getCamera(_position, _target, _focal);

  float dist;
  vec4 point = intersect(_position, dir, dist);

  color = getColor(point, dir);

  float distToBorder = smoothstep(0.0, 8.0, min(gl_FragCoord.y, _resolution.y - gl_FragCoord.y));
  gl_FragColor = mix(_background, color, distToBorder);
}
