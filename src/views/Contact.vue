<template>
    <div class="contact-container">
        <div class="contact-vitals">
            <div class="title">
                Let's make something <br /><strong class="contact-vitals-bold">phenomenal</strong>.
            </div>
            <div class="contact-vitals">
                <div><i class="fas fa-phone"></i><span>+52 222 1888 266</span></div>
                <br />
                <div><i class="fas fa-envelope"></i><span>manuelalejandrosac@gmail.com</span></div>
            </div>
            <div class="contact-vitals-social">
                <a
                    href="https://www.linkedin.com/in/manuel-sanchez-2b43801bb/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fab fa-linkedin-in"></i>
                </a>
                <a href="https://github.com/Erzihark" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-github"></i>
                </a>
                <a
                    href="https://www.instagram.com/manuelalejandrosac"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <i class="fab fa-instagram"></i>
                </a>
            </div>
        </div>
        <form
            class="contact-form"
            action="https://formsubmit.co/426711cf8864ce854671e0760f655f12"
            method="POST"
        >
            <input type="hidden" name="_captcha" value="false" />
            <input
                id="form-name"
                class="contact-form_field"
                type="text"
                placeholder="Your Name"
                required=""
            />
            <input
                id="form-email"
                class="contact-form_field"
                type="email"
                placeholder="Email Address"
                required=""
            />
            <textarea id="form-msg" class="contact-form_field" placeholder="Message..."></textarea>
            <input id="smit" class="contact-form_submit" type="submit" value="Submit" />
        </form>
    </div>
</template>

<script>
export default {
    name: 'ContactView'
};
</script>
