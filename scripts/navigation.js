function toggleMenu() {
    const menu = document.getElementById("nav-links");
    const icon = document.getElementById("menu-icon");

    if (!menu || !icon) {
        return;
    }

    menu.classList.toggle("active");

    const isOpen = menu.classList.contains("active");
    icon.classList.toggle("fa-bars", !isOpen);
    icon.classList.toggle("fa-times", isOpen);
}
