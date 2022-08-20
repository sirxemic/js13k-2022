export function draw(mesh, material) {
  material.shader.bind();
  for(let i = 0; i < material.textures.size; i++) {
    if(material.textures[i]) {
      material.textures[i].bind(i);
    }
  }
  mesh.vertexbuffer.draw();
  material.shader.unbind();
}
