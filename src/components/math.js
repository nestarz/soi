// Rotate
const to_radians = Math.PI / 180;
const to_degrees = 180 / Math.PI;

// Cross product
const cross = ([u0, u1, u2], [v0, v1, v2]) => [
  u1 * v2 - u2 * v1,
  u2 * v0 - u0 * v2,
  u0 * v1 - u1 * u0
];

// Dot product
const dot = (u, v) => u.reduce((sum, _, i) => sum + u[i] * v[i], 0);

// This function converts a [lon, lat] coordinates into a [x,y,z] coordinate
// the [x, y, z] is Cartesian, with origin at lon/lat (0,0) center of the earth
const lonlat2xyz = ([lon_deg, lat_deg]) => {
  const lon_rad = lon_deg * to_radians;
  const lat_rad = lat_deg * to_radians;

  const x = Math.cos(lat_rad) * Math.cos(lon_rad);
  const y = Math.cos(lat_rad) * Math.sin(lon_rad);
  const z = Math.sin(lat_rad);

  return [x, y, z];
};

const quaternion = (u, v) => {
  if (!(u && v)) return;

  const w = cross(u, v); // vector pendicular to u and v
  const w_len = Math.sqrt(dot(w, w)); // length of w

  if (w_len == 0) return;

  const theta = 0.5 * Math.acos(Math.max(-1, Math.min(1, dot(u, v))));

  if (!theta) return;

  const qi = (w[2] * Math.sin(theta)) / w_len;
  const qj = (-w[1] * Math.sin(theta)) / w_len;
  const qk = (w[0] * Math.sin(theta)) / w_len;
  const qr = Math.cos(theta);

  return [qr, qi, qj, qk];
};

// Converts euler angles to quaternion
const euler2quat = e => {
  if (!e) return;

  const [roll, pitch, yaw] = e.map(ei => 0.5 * ei * to_radians);

  const sr = Math.sin(roll);
  const cr = Math.cos(roll);
  const sp = Math.sin(pitch);
  const cp = Math.cos(pitch);
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);

  const qi = sr * cp * cy - cr * sp * sy;
  const qj = cr * sp * cy + sr * cp * sy;
  const qk = cr * cp * sy - sr * sp * cy;
  const qr = cr * cp * cy + sr * sp * sy;

  return [qr, qi, qj, qk];
};

// This functions computes a quaternion multiply
// Geometrically, it means combining two quant rotations
const quatMultiply = (q1, q2) => {
  if (!q1 || !q2) return;

  const [a, b, c, d] = q1;
  const [e, f, g, h] = q2;

  return [
    a * e - b * f - c * g - d * h,
    b * e + a * f + c * h - d * g,
    a * g - b * h + c * e + d * f,
    a * h + b * g - c * f + d * e
  ];
};

// This function computes quaternion to euler angles
// https://en.wikipedia.org/wiki/Rotation_formalisms_in_three_dimensions#Euler_angles_.E2.86.94_Quaternion
const quat2euler = q => {
  if (!q) return;

  const { atan2, asin, min, max } = Math;
  const [qi, qj, qk, qr] = q;

  const roll = atan2(2 * (qi * qj + qk * qr), 1 - 2 * (qj ** 2 + qk ** 2));
  const pitch = asin(max(-1, min(1, 2 * (qi * qk - qr * qj))));
  const yaw = atan2(2 * (qi * qr + qj * qk), 1 - 2 * (qk ** 2 + qr ** 2));

  return [roll * to_degrees, pitch * to_degrees, yaw * to_degrees];
};

/*  This function computes the euler angles when given two vectors, and a rotation
      This is really the only math function called with d3 code.

      v0 - starting pos in lon/lat, commonly obtained by projection.invert
      v1 - ending pos in lon/lat, commonly obtained by projection.invert
      o0 - the projection rotation in euler angles at starting pos (v0), commonly obtained by projection.rotate
    */
const eulerAngles = (x, y, o0) => {
  /*
        The math behind this:
        - first calculate the quaternion rotation between the two vectors, u & v
        - then multiply this rotation onto the original rotation at u
        - finally convert the resulted quat angle back to euler angles for d3 to rotate
      */

  const [u, v] = [lonlat2xyz(x), lonlat2xyz(y)];
  const t = quatMultiply(euler2quat(o0), quaternion(u, v));
  return quat2euler(t);
};

export { eulerAngles };
