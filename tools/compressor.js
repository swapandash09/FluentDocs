document.addEventListener('DOMContentLoaded', () => {
  const imageInput = document.getElementById('image-input');
  const compressBtn = document.getElementById('compress-btn');
  const output = document.getElementById('output');

  compressBtn.addEventListener('click', () => {
    const file = imageInput.files[0];
    if (!file) {
      output.innerHTML = '<p class="text-red-500">Please select an image.</p>';
      return;
    }

    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1024,
      maxHeight: 1024,
      success(result) {
        const url = URL.createObjectURL(result);
        output.innerHTML = `
          <p class="text-green-500">Image compressed successfully!</p>
          <a href="${url}" download="compressed-image.jpg" class="text-primary hover:underline">Download</a>
          <img src="${url}" class="mt-4 max-w-full h-auto" alt="Compressed Image">
        `;
      },
      error(err) {
        output.innerHTML = `<p class="text-red-500">Error: ${err.message}</p>`;
      },
    });
  });
});