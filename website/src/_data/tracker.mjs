export default function () {
  return {
    items: [],
    summary: {
      total: 0,
      p1: 0,
      ready: 0,
      submitted: 0,
      changed: 0,
    },
    generatedAt: new Date().toISOString(),
  };
}
