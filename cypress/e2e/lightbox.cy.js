describe('Lightbox', () => {
  const overlayRoot = '.relative.w-64.cursor-pointer.shadow-md';
  const lightbox = '#lightbox';

  const openLightbox = () => {
    cy.get(overlayRoot).trigger('mouseover');
    cy.get(`${overlayRoot} img`).click({ force: true });
    cy.get(lightbox).should('be.visible');
  };

  const closeLightbox = () => {
    cy.get('body').click(5, 5, { force: true });
  };

  const hoverOverlay = () => {
    cy.get(overlayRoot).trigger('mouseover');
    cy.get(`${overlayRoot} .absolute.top-0.left-0.bg-black.bg-opacity-60`).should('be.visible');
  };

  const addComment = (comment) => {
    cy.get(`${lightbox} input[name="comment"]`).clear().type(comment);
    cy.get(`${lightbox} button[type="submit"]`).should('not.be.disabled').click();
  };

  const getOverlayCounts = () => cy.get(`${overlayRoot} .text-sm.text-white`);

  const getLightboxLikeCount = () => cy.get(`${lightbox} .bg-white.flex.items-center.pt-4.px-4 .text-xs.font-semibold.ml-2`);

  const getLightboxCommentsToggle = () => cy.get(`${lightbox} .bg-white.flex.items-center.py-4.px-4 div`);

  beforeEach(() => {
    cy.visit('/lightbox.html');
  });

  it('ouvre la lightbox au clic sur l image', () => {
    cy.get(lightbox).should('not.be.visible');

    cy.get(overlayRoot).trigger('mouseover');
    cy.get(`${overlayRoot} img`).click({ force: true });

    cy.get(lightbox).should('be.visible');
  });

  it('ferme la lightbox au clic en dehors de la lightbox', () => {
    openLightbox();

    closeLightbox();

    cy.get(lightbox).should('not.be.visible');
  });

  it('ajoute la mention j aime et met a jour les compteurs', () => {
    hoverOverlay();
    getOverlayCounts().eq(0).should('have.text', '0');
    getOverlayCounts().eq(1).should('have.text', '0');

    openLightbox();

    cy.get(`${lightbox} svg[title="Like"]`).click();
    getLightboxLikeCount().should('have.text', '1');

    closeLightbox();
    hoverOverlay();
    getOverlayCounts().eq(0).should('have.text', '1');
    getOverlayCounts().eq(1).should('have.text', '0');
  });

  it('supprime la mention j aime et met a jour les compteurs', () => {
    openLightbox();

    cy.get(`${lightbox} svg[title="Like"]`).click();
    getLightboxLikeCount().should('have.text', '1');

    cy.get(`${lightbox} svg[title="Dislike"]`).click();
    getLightboxLikeCount().should('have.text', '0');

    closeLightbox();
    hoverOverlay();
    getOverlayCounts().eq(0).should('have.text', '0');
    getOverlayCounts().eq(1).should('have.text', '0');
  });

  it('ajoute un commentaire et met a jour les compteurs', () => {
    openLightbox();

    addComment('Cypress is awesome!');

    cy.contains(lightbox, 'Cypress is awesome!').should('be.visible');
    getLightboxCommentsToggle().should('contain.text', 'Hide 1 comment');

    closeLightbox();
    hoverOverlay();
    getOverlayCounts().eq(1).should('have.text', '1');
  });

  it('empêche la publication d un commentaire vide', () => {
    openLightbox();

    cy.get(`${lightbox} input[name="comment"]`).should('have.value', '');
    cy.get(`${lightbox} button[type="submit"]`).should('be.disabled');
  });

  it('cache et affiche les commentaires avec l option dediee', () => {
    openLightbox();
    addComment('Cypress is awesome!');

    cy.get(`${lightbox} .bg-white.flex.flex-col`).should('be.visible');
    getLightboxCommentsToggle().should('contain.text', 'Hide 1 comment').click();
    cy.get(`${lightbox} .bg-white.flex.flex-col`).should('not.be.visible');
    getLightboxCommentsToggle().should('contain.text', 'Show 1 comment').click();
    cy.get(`${lightbox} .bg-white.flex.flex-col`).should('be.visible');
  });

  it('met a jour les compteurs de commentaires sur l overlay et la lightbox', () => {
    openLightbox();
    addComment('Premier commentaire');
    addComment('Second commentaire');

    getLightboxCommentsToggle().should('contain.text', 'Hide 2 comments');

    closeLightbox();
    hoverOverlay();
    getOverlayCounts().eq(1).should('have.text', '2');
  });

  it('gere le singulier et le pluriel selon le nombre de commentaires', () => {
    openLightbox();

    addComment('Un commentaire');
    getLightboxCommentsToggle().should('contain.text', 'Hide 1 comment');

    addComment('Deuxieme commentaire');
    getLightboxCommentsToggle().should('contain.text', 'Hide 2 comments');
  });

  it('supprime le second commentaire au clic sur la bonne croix', () => {
    openLightbox();

    addComment('Premier commentaire');
    addComment('Second commentaire');
    addComment('Troisieme commentaire');

    cy.contains(`${lightbox} .bg-white.flex.flex-col > div`, 'Second commentaire')
      .find('svg[title="Supprimer le commentaire"]')
      .click();

    cy.contains(lightbox, 'Premier commentaire').should('be.visible');
    cy.contains(lightbox, 'Second commentaire').should('not.exist');
    cy.contains(lightbox, 'Troisieme commentaire').should('be.visible');
    getLightboxCommentsToggle().should('contain.text', 'Hide 2 comments');
  });
});