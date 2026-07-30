export default function AdoptionProcessPage() {
  return (
    <div className="adoption-process-page">
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Processo de Adoção</h1>
          <p className="page-hero-subtitle">
            Conheça as etapas do nosso processo de adoção responsável.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="process-timeline">
            <div className="process-step">
              <div className="process-step-number">1</div>
              <div className="process-step-content">
                <h3>Manifestação de Interesse</h3>
                <p>
                  Preencha o formulário de interesse indicando o animal desejado e
                  suas informações básicas.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-step-number">2</div>
              <div className="process-step-content">
                <h3>Análise Inicial</h3>
                <p>
                  Nossa equipe analisa as informações fornecidas e verifica a
                  compatibilidade com o perfil do animal.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-step-number">3</div>
              <div className="process-step-content">
                <h3>Entrevista</h3>
                <p>
                  Realizamos uma conversa para conhecer melhor o adotante e
                  esclarecer dúvidas sobre o processo.
                </p>
              </div>
            </div>
            <div className="process-step">
              <div className="process-step-number">4</div>
              <div className="process-step-content">
                <h3>Acompanhamento Pós-Adoção</h3>
                <p>
                  Após a adoção, mantemos contato para garantir o bem-estar do
                  animal e oferecer suporte.
                </p>
              </div>
            </div>
          </div>

          <div className="process-note">
            <p>
              As etapas podem variar conforme cada caso. Nosso objetivo é garantir
              uma adoção responsável e duradoura.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
