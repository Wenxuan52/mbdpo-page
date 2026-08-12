// Interactions for the MBDPO project page.
// Plain DOM APIs only — the page no longer loads jQuery.

// Called from the inline onclick on the BibTeX copy button.
function copyBibTeX() {
    const code = document.querySelector('#bibtex-code code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button && button.querySelector('.copy-text');
    if (!code || !copyText) return;

    const bibtex = code.innerText;

    function showCopied() {
        button.classList.add('copied');
        copyText.textContent = 'Copied!';
        setTimeout(function () {
            button.classList.remove('copied');
            copyText.textContent = 'Copy';
        }, 2000);
    }

    function fallbackCopy() {
        const textArea = document.createElement('textarea');
        textArea.value = bibtex;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopied();
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(bibtex).then(showCopied).catch(fallbackCopy);
    } else {
        fallbackCopy();
    }
}

// Called from the inline onclick on the scroll-to-top button.
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function () {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (!scrollButton) return;
    scrollButton.classList.toggle('visible', window.pageYOffset > 300);
});
