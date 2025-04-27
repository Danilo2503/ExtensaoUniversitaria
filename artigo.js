// Função para verificar se os estilos foram carregados
function checkStylesLoaded() {
  const styleSheets = document.styleSheets
  let stylesLoaded = false

  for (let i = 0; i < styleSheets.length; i++) {
    try {
      // Tenta acessar as regras do stylesheet para verificar se foi carregado
      const rules = styleSheets[i].cssRules || styleSheets[i].rules
      if (rules && rules.length > 0) {
        stylesLoaded = true
        break
      }
    } catch (e) {
      // Erro de CORS ao tentar acessar stylesheet de outro domínio
      continue
    }
  }

  if (!stylesLoaded) {
    console.error("Estilos não foram carregados corretamente!")

    // Adiciona estilos inline de emergência
    const emergencyStyles = document.createElement("style")
    emergencyStyles.textContent = `
            body { background-color: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
            .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
            .article-content { max-width: 800px; margin: 0 auto; padding: 2rem 0; }
            h1, h2, h3 { margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; }
            .article-toc { background-color: rgba(30, 41, 59, 0.5); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
            .article-toc ul { list-style-type: none; padding-left: 0; }
            .article-toc li { margin-bottom: 0.75rem; }
            .article-toc a { color: #94a3b8; }
        `
    document.head.appendChild(emergencyStyles)
  }
}

// Executa a verificação quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  // Verifica se os estilos foram carregados após um pequeno delay
  setTimeout(checkStylesLoaded, 500)

  // Table of Contents Active State
  const sections = document.querySelectorAll(".article-section")
  const tocLinks = document.querySelectorAll(".article-toc a")

  // Intersection Observer for sections
  const observerOptions = {
    rootMargin: "-100px 0px -80% 0px",
    threshold: 0,
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute("id")
        setActiveLink(activeId)
      }
    })
  }, observerOptions)

  sections.forEach((section) => {
    observer.observe(section)
  })

  function setActiveLink(id) {
    tocLinks.forEach((link) => {
      link.classList.remove("active")
      const href = link.getAttribute("href").substring(1)
      if (href === id) {
        link.classList.add("active")
      }
    })
  }

  // Smooth scrolling for ToC links
  tocLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const targetId = this.getAttribute("href")
      const targetElement = document.querySelector(targetId)

      if (targetElement) {
        const headerOffset = 80
        const elementPosition = targetElement.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        })

        // Update URL without page reload
        history.pushState(null, null, targetId)
      }
    })
  })

  // Back to Top Button
  const backToTopButton = document.getElementById("backToTop")

  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add("visible")
    } else {
      backToTopButton.classList.remove("visible")
    }
  })

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  })

  // Copy Link Button
  const copyLinkButton = document.getElementById("copyLink")

  copyLinkButton.addEventListener("click", () => {
    const currentUrl = window.location.href

    navigator.clipboard.writeText(currentUrl).then(() => {
      // Show tooltip or notification
      const originalText = copyLinkButton.innerHTML
      copyLinkButton.innerHTML = '<i class="fa-solid fa-check"></i>'

      setTimeout(() => {
        copyLinkButton.innerHTML = originalText
      }, 2000)
    })
  })

  // Mobile TOC Toggle
  const tocHeader = document.querySelector(".toc-header")
  const tocList = document.querySelector(".article-toc ul")

  if (window.innerWidth < 768) {
    tocList.style.display = "none"

    tocHeader.addEventListener("click", () => {
      if (tocList.style.display === "none") {
        tocList.style.display = "block"
      } else {
        tocList.style.display = "none"
      }
    })
  }

  // Set current year in footer
  document.getElementById("current-year").textContent = new Date().getFullYear()

  // Estimated reading time calculation
  function calculateReadingTime() {
    const articleBody = document.querySelector(".article-body")
    const text = articleBody.textContent
    const wordCount = text.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / 200) // Assuming 200 words per minute

    const readingTimeElement = document.querySelector(".article-info span:nth-child(2)")
    if (readingTimeElement) {
      readingTimeElement.innerHTML = `<i class="fa-regular fa-clock"></i> ${readingTime} min de leitura`
    }
  }

  calculateReadingTime()
})
