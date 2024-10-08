// Draws a rounded rectangle on the canvas.
export const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: boolean = true
) => {
  // Ensure radius doesn't exceed half of the rectangle's dimensions
  radius = Math.min(radius, width / 2, height / 2);

  ctx.beginPath();
  ctx.moveTo(x + radius, y);

  // Top edge and top-right corner
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);

  // Right edge and bottom-right corner
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);

  // Bottom edge and bottom-left corner
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);

  // Left edge and top-left corner
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);

  ctx.closePath();

  if (fill) {
    ctx.fill();
  }
};